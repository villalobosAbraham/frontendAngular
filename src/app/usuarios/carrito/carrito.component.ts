import { Component, ViewChild } from '@angular/core';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Router } from '@angular/router';
import { BarraUsuarioComponent } from '../barra-usuario/barra-usuario.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { FormsModule } from '@angular/forms';
import { LibrosCarritoComponent } from '../libros-carrito/libros-carrito.component';

@Component({
  selector: 'app-carrito',
  imports: [BarraUsuarioComponent, CommonModule, FormsModule, LibrosCarritoComponent],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  constructor(private Router : Router, private sweetAlert : SweetAlertService, private AlmacenamientoLocalService : AlmacenamientoLocalService, private ApiService : ApiService) {};
  librosCarrito : any = "";

  ngOnInit() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.ApiService.post('INVObtenerLibrosCarritoCompra/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.librosCarrito = response;
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
}
