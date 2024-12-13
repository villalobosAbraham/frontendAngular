import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { datosGeneralesEncapsulado } from '../shared/interfaces/datos-generales';
import { ApiService } from '../services/api.service';
import { SweetAlertService } from '../services/sweet-alert.service';
import { AlmacenamientoLocalService } from '../services/almacenamiento-local.service';
import { Router } from '@angular/router';
declare var $: any;


@Component({
  selector: 'app-registrar',
  standalone : true,
  imports: [FormsModule],
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.css'
})
export class RegistrarComponent {
  constructor(private ApiService : ApiService, private sweetAlert : SweetAlertService, private AlmacenamientoLocalService : AlmacenamientoLocalService, private Router : Router) {}
  nombre : string = "";
  apellidoPaterno : string = "";
  apellidoMaterno : string = "";
  telefono : string = "";
  fechaNacimiento : string = "";
  fechaActual = new Date().getFullYear();
  correo : string = "";
  password : string = "";

  ngOnInit() {
    $('#inputFechaNacimiento').datepicker({
      dateFormat: 'dd/mm/yy',
      autoclose: true,
      todayHighlight: true,
      locale: "es"
    });
  }
  registrarUsuario() {
    let datosGenerales = this.prepararDatosGenerales();
    if (!datosGenerales) {
      return;
    }

    this.ApiService.post('LOGRegistrarUsuario/', datosGenerales).subscribe(
      (response) => {
        if (response == false) {
          this.sweetAlert.mensajeError("Correo en Uso");
        } else {
          this.sweetAlert.mensajeFunciono("Usuario Agregado Correctamente");
          this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', response); // Para objetos
          this.Router.navigate(['login']);
        }
      },
      (error) => {
        this.sweetAlert.mensajeError("Fallo de Conexion al Servidor");
      }
    );
  }

  prepararDatosGenerales() {
    let regexNombreApellido = /^[A-Za-z]{3,}(?:\s[A-Za-z]{3,})?$/;
    let regexTelefono = /^\d{10}$/;
    let regexFecha = /^(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    let regexCorreo = /^(?=.*[A-Za-z])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    let regexContraseña = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

    let fechaModificado = this.fechaNacimiento.split("/").reverse().join("-");
    if (!regexNombreApellido.test(this.nombre)) {
      this.sweetAlert.mensajeError("Nombre Invalido");
      return false;
    } else if (!regexNombreApellido.test(this.apellidoPaterno)) {
      this.sweetAlert.mensajeError("Apellido Paterno Invalido");
      return false;
    } else if (!regexNombreApellido.test(this.apellidoMaterno)) {
      this.sweetAlert.mensajeError("Apellido Materno Invalido");
      return false;
    } else if (!regexTelefono.test(this.telefono)) {
      this.sweetAlert.mensajeError("Numero Telefonico Invalido");
      return false;
    } else if (!regexFecha.test(fechaModificado)) {
      this.sweetAlert.mensajeError("Fecha Invalida");
      return false;
    } else if (!regexCorreo.test(this.correo)) {
      this.sweetAlert.mensajeError("Correo Invalido");
      return false;
    } else if (!regexContraseña.test(this.password)) {
      this.sweetAlert.mensajeError("Contraseña Invalida");
      return false;
    }

    let datos = {
      nombre : this.nombre,
      apellidoPaterno : this.apellidoPaterno,
      apellidoMaterno : this.apellidoMaterno,
      telefono : this.telefono,
      fechaNacimiento : fechaModificado,
      email : this.correo,
      contraseña : this.password,
    };

    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : datos
    };

    return datosGenerales;
  }

  regresar() {
    this.Router.navigate(['login']);
  }
}
