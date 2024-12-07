import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
declare var $: any;

@Component({
  selector: 'app-barra-usuario',
  standalone : true,
  imports: [FormsModule],
  templateUrl: './barra-usuario.component.html',
  styleUrl: './barra-usuario.component.css'
})
export class BarraUsuarioComponent {
  constructor(private ApiService: ApiService, private router: Router, private sweetAlert : SweetAlertService, private AlmacenamientoLocalService : AlmacenamientoLocalService) {}
  listaCarrito : any = "listaCarrito"
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

    this.ApiService.post('INVComprobarCarritoCantidad/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          return;
        } 
        this.carrito = response;
        if (response as number > 0) {
          let listaCarrito = document.getElementById(this.listaCarrito) as HTMLElement;
          listaCarrito.style.backgroundColor = "#442071";
        } 
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
    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : token
    };
    
    return datosGenerales;
  }

  obtenerUsuario() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.ApiService.post('LOGObtenerUsuarioBarra/', datosGenerales).subscribe(
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

  guardarUsuario() {
    let datosGenerales = this.prepararDatosGeneralesGuardarUsuario();
    if (!datosGenerales) {
      return;
    }
    this.ApiService.post('LOGGuardarInformacionUsuarioBarra/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean' && response == false) {
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        $("#" + this.modalUsuario).modal("hide");
        this.obtenerUsuario();
      },
      (error) => {
        this.sweetAlert.mensajeError("Fallo de Conexion con el Servidor");
      }
    );
  }

  prepararDatosGeneralesGuardarUsuario() {
    let regexTelefono = /^\d{10}$/;
    let regexFecha = /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    let regexNombreApellido = /^[A-Za-z]{3,}(?:\s[A-Za-z]{3,})?$/;

    let fechaModificado = this.fechaNacimientoUsuario.split("/").reverse().join("-");
    if (!regexNombreApellido.test(this.nombreUsuario)) {
      this.sweetAlert.mensajeError("Nombre Invalido");
      return false;
    } else if (!regexNombreApellido.test(this.apellidoPaternoUsuario)) {
      this.sweetAlert.mensajeError("Apellido Paterno Invalido");
      return false;
    } else if (!regexNombreApellido.test(this.apellidoMaternoUsuario)) {
      this.sweetAlert.mensajeError("Apellido Materno Invalido");
      return false;
    } else if (!regexTelefono.test(this.telefonoUsuario)) {
      this.sweetAlert.mensajeError("Numero Telefonico Invalido");
      return false;
    } else if (!regexFecha.test(fechaModificado)) {
      this.sweetAlert.mensajeError("Fecha Invalida");
      return false;
    }

    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);

    let datos = {
      nombre : this.nombreUsuario,
      apellidoPaterno : this.apellidoPaternoUsuario,
      apellidoMaterno : this.apellidoMaternoUsuario,
      telefono : this.telefonoUsuario,
      fechaNacimiento : fechaModificado,
      idUsuario : token["idUsuario"]
    };

    let datosGeneralesTokenDatos = {
      token : token,
      datosGenerales : datos,
    }
    
    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : datosGeneralesTokenDatos
    };
    
    return datosGenerales;
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

