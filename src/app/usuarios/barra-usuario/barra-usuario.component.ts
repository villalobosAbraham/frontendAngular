import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
declare var $: any;

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
  irCarrito : string = "carrito";
  irCompras : string = "compras";
  modalUsuario : string = "modalUsuario";
  nombreUsuarioBarra : string = "";
  nombreUsuario : string = "";
  apellidoPaternoUsuario : string = "";
  apellidoMaternoUsuario : string = "";
  correoUsuario : string = "";
  telefonoUsuario : string = "";
  fechaNacimientoUsuario : string = "";


  ngOnInit() {
    $('#fechaCumpleaños').datepicker({
      dateFormat: 'dd/mm/yy',
      autoclose: true,
      todayHighlight: true,
      locale: "es"
    });
    this.comprobarCantidadCarrito();
    this.obtenerUsuario();
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

  obtenerUsuario() {
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
        this.llenarModalUsuario(usuario);
      },
      (error) => {
        this.router.navigate(['login']);
      }
    );
  }

  llenarModalUsuario(usuario : any) {
    this.nombreUsuario = usuario[0];
    this.apellidoPaternoUsuario = usuario[1];
    this.apellidoMaternoUsuario = usuario[2];
    this.correoUsuario = usuario[3];
    this.telefonoUsuario = usuario[4];
    this.fechaNacimientoUsuario = usuario[5].split("-").reverse().join("/");

    $("#fechaCumpleaños").datepicker("setDate", this.fechaNacimientoUsuario);
  }

  mostrarUsuario() {
    $("#" + this.modalUsuario).modal("show");
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

