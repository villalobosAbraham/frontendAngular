import { Component, ViewChild } from '@angular/core';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Router } from '@angular/router';
import { BarraUsuarioComponent } from '../barra-usuario/barra-usuario.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { FiltroGeneroComponent } from '../filtro-genero/filtro-genero.component';
import { LibroComponent } from "../libro/libro.component";
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { FormsModule } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-principal',
  imports: [BarraUsuarioComponent, FiltroGeneroComponent, LibroComponent, CommonModule, FormsModule],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent {
  constructor(private Router : Router, private sweetAlert : SweetAlertService, private AlmacenamientoLocalService : AlmacenamientoLocalService, private ApiService : ApiService) {};
  @ViewChild(BarraUsuarioComponent) BarraUsuarioComponent!: BarraUsuarioComponent;
  @ViewChild(FiltroGeneroComponent) FiltroGeneroComponent!: FiltroGeneroComponent;
  token : any; 
  idBarraUsuario : string = "barraUsuario";
  librosPopulares : any = "";
  librosRecomendados : any = "";
  librosBuscados : any = "";
  modalLibro : any = "modalDetalles";
  libroDetalle : any = "";
  busquedaLibro : any = "";
  librosPaginados: any[] = []; // Libros visibles en la página actual
  paginaActual: number = 1; // Página inicial
  librosPorPagina: number = 3; // Número de libros por página
  
  ngOnInit() {
    let almacenamientoLocal = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    if (!almacenamientoLocal) {
      this.Router.navigate(['login']);
      return;
    }
    almacenamientoLocal = this.AlmacenamientoLocalService.actualizarToken(almacenamientoLocal);
    if (!almacenamientoLocal) {
      this.Router.navigate(['login']);
      return;
    }
    
    this.obtenerLibrosPopulares();
    this.obtenerLibrosRecomendados();
  }

  obtenerLibrosPopulares() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.ApiService.post('INVObtenerLibrosPopulares/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.librosPopulares = response;
      },
      (error) => {
        this.Router.navigate(['login']);
      }
    );
  }

  prepararDatosGeneralesSoloToken() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : token
    };
    
    return datosGenerales;
  }

  obtenerLibrosRecomendados() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.ApiService.post('INVObtenerLibrosRecomendados/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.librosRecomendados = response;
      },
      (error) => {
        this.Router.navigate(['login']);
      }
    );
  }

  hacerActualizarCarrito(mensaje : any) {
    this.BarraUsuarioComponent.comprobarCantidadCarrito();
  }

  mostrarLibro(detalles : any) {
    this.libroDetalle = detalles;
    this.libroDetalle[5] = this.libroDetalle[5].split("-").reverse().join("/");
    $("#" + this.modalLibro).modal("show");
  }

  filtrarLibros() {
    let datosGenerales = this.prepararDatosGeneralesBuscarLibros();

    this.ApiService.post('CONFFiltrarLibros/', datosGenerales).subscribe(
      (response) => {
        if (response == false) {
          this.sweetAlert.mensajeInformacion("No hay Libros Coincidentes");
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.librosBuscados = response;
        this.paginaActual = 1; // Reiniciar a la primera página
        this.actualizarLibrosPaginados();
        $("#divFiltrados").css("display", "block");
      },
      (error) => {
        this.sweetAlert.mensajeError("Fallo de Conexion al Servidor");
      }
    );
  }

  prepararDatosGeneralesBuscarLibros() {
    let idsGeneros = this.FiltroGeneroComponent.obtenerGenerosSeleccionados();
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGeneralesAntesEncapsular = {
      libro : this.busquedaLibro,
      idsGeneros : idsGeneros,
    };

    let datosGenerales = {
      datosGenerales : datosGeneralesAntesEncapsular,
      token : token,
    }
    let datosGeneralesEncapsulados : datosGeneralesEncapsulado = {
      datosGenerales : datosGenerales
    };

    return datosGeneralesEncapsulados;
  }

  actualizarLibrosPaginados() {
    const inicio = (this.paginaActual - 1) * this.librosPorPagina;
    const fin = inicio + this.librosPorPagina;
    this.librosPaginados = this.librosBuscados.slice(inicio, fin);
  }

  cambiarPagina(nuevaPagina: number) {
    this.paginaActual = nuevaPagina;
    this.actualizarLibrosPaginados();
  }

  totalPaginas(): number {
    return Math.ceil(this.librosBuscados.length / this.librosPorPagina);
  }

  ocultarLibrosFiltrados(mensaje : any) {
    $("#divFiltrados").css("display", "none");
  }
}
