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
  token : any; 
  idBarraUsuario : string = "barraUsuario";
  librosPopulares : any = "";
  librosRecomendados : any = "";
  modalLibro : any = "modalDetalles";
  libroDetalle : any = "";
  
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
}
