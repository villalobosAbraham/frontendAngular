import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';

@Component({
  selector: 'app-libro',
  standalone: true,
  imports: [],
  templateUrl: './libro.component.html',
  styleUrl: './libro.component.css'
})
export class LibroComponent {
  constructor(private ApiService : ApiService, private Router : Router, private AlmacenamientoLocalService : AlmacenamientoLocalService, private SweetAlertService : SweetAlertService) {}
  @Input() libro : any = "";
  @Output() aumentoCarrito = new EventEmitter();
  @Output() detallesLibro = new EventEmitter();
  
  agregarLibroCarrito() {
    let datosGenerales = this.prepararDatosGeneralesAumentarCarrito();
    if (!datosGenerales) {
      return;
    }
    this.ApiService.post('INVAgregarAumentarLibroCarrito/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean' && response == false) {
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.mensajeFuncionoAgregarLibro();
        this.aumentoCarrito.emit();
      },
      (error) => {
        this.SweetAlertService.mensajeError("Fallo de Conexion con el Servidor");
      }
    );
  }

  prepararDatosGeneralesAumentarCarrito() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datos = {
      idLibro : this.libro[0],
      cantidad : 1,
      idUsuario : token["idUsuario"]
    }

    let datosGeneralesTokenDatos = {
      token : token,
      datosGenerales : datos,
    }
    
    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : datosGeneralesTokenDatos
    };
    
    return datosGenerales;
  }

  verDetallesLibro() {
    let datosGenerales = this.prepararDatosGeneralesDetallesLibro();
    if (!datosGenerales) {
      return;
    }
    this.ApiService.post('INVObtenerDetallesLibro/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean' && response == false) {
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.detallesLibro.emit(response);
      },
      (error) => {
        this.SweetAlertService.mensajeError("Fallo de Conexion con el Servidor");
      }
    );
  }

  prepararDatosGeneralesDetallesLibro() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datos = {
      idLibro : this.libro[0],
    }

    let datosGeneralesTokenDatos = {
      token : token,
      datosGenerales : datos,
    }
    
    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : datosGeneralesTokenDatos
    };
    
    return datosGenerales;
  }
}
