import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { SweetAlertService } from '../../services/sweet-alert.service';

interface datosGeneralesEncapsulado {
  datosGenerales : any
}
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
  
  agregarLibroCarrito() {
    let datosGenerales = this.prepararDatosGenerales();
    if (!datosGenerales) {
      return;
    }
    this.ApiService.post('INVAgregarAumentarLibroCarrito/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
      },
      (error) => {
        this.SweetAlertService.mensajeError("Fallo de Conexion con el Servidor");
      }
    );
  }

  prepararDatosGenerales() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    let datos = {
      idLibro : this.libro[0],
      cantidad : 1,
      idUsuario : token["idUsuario"]
    }

    let datosGeneralesTokenDatos = {
      token : token,
      datosGenerales : datos,
    }
    
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : datosGeneralesTokenDatos
    };
    
    return datosGenerales;
  }
}
