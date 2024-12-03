import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';

interface datosGeneralesObtenerCantidadCarrito {
  datosGenerales : any
}
@Component({
  selector: 'app-barra-usuario',
  standalone : true,
  imports: [],
  templateUrl: './barra-usuario.component.html',
  styleUrl: './barra-usuario.component.css'
})
export class BarraUsuarioComponent {
  constructor(private apiService: ApiService, private router: Router, private sweetAlert : SweetAlertService, private AlmacenamientoLocalService : AlmacenamientoLocalService) {}
  carrito : any = 0;
  irInicio : string = "principal";
  nombreUsuarioBarra : string = "";

  ngOnInit() {
    this.comprobarCantidadCarrito();
    this.obtenerNombresUsuarios();
  }

  comprobarCantidadCarrito() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.apiService.post('INVComprobarCarritoCantidad/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          return;
        } 
        this.carrito = response;
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
      },
      (error) => {
        this.router.navigate(['login']);
      }
    );
  }
  
  prepararDatosGeneralesSoloToken() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGenerales : datosGeneralesObtenerCantidadCarrito = {
      datosGenerales : token
    };
    
    return datosGenerales;
  }

  obtenerNombresUsuarios() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.apiService.post('LOGObtenerUsuarioBarra/', datosGenerales).subscribe(
      (response) => {
        let usuario = response as any;
        if (typeof response === 'boolean') {
          this.nombreUsuarioBarra = "Usuario"
          return;
        } 
        this.nombreUsuarioBarra = usuario[0] + " " + usuario[1] + " " + usuario[2];
      },
      (error) => {
        this.router.navigate(['login']);
      }
    );
  }

  cerrarSesion() {
    try {
      this.AlmacenamientoLocalService.limpiarAlmacenamientoLocal();
      this.router.navigate(['login']);
    } catch($e) {
      this.sweetAlert.mensajeError("Fallo al Cerrar Sesión");
    }
  }
}

