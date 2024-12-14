import { Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../services/sweet-alert.service';
import { AlmacenamientoLocalService } from '../services/almacenamiento-local.service';

interface Valores {
  correo: string;
  contraseña: string;
}

interface DatosGenerales {
  datosGenerales : Valores
}

@Component({
  selector: 'app-login',
  standalone : true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private apiService: ApiService, private router: Router, private sweetAlert : SweetAlertService, private AlmacenamientoLocalService : AlmacenamientoLocalService) {}
  @ViewChild('correo') correo!: ElementRef<HTMLInputElement>;
  @ViewChild('contraseña') contraseña!: ElementRef<HTMLInputElement>;
  valores : Valores = {
    correo : "",
    contraseña : ""
  }
  datosGenerales : DatosGenerales = {
    datosGenerales : this.valores
  }
  respuesta = false ;
  fechaActual = new Date().getFullYear();
  
  ngOnInit() {
    let almacenamientoLocal = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    if (!almacenamientoLocal) {
      return;
    }
    almacenamientoLocal = this.AlmacenamientoLocalService.actualizarToken(almacenamientoLocal);
    if (!almacenamientoLocal) {
      return;
    }

    this.iniciarSesionTokens(almacenamientoLocal);
  }


  iniciarSesion() {
    this.valores.correo = this.correo.nativeElement.value;
    this.valores.contraseña = this.contraseña.nativeElement.value;
    this.datosGenerales.datosGenerales = this.valores
    
    this.apiService.post('LOGIniciarSesion/', this.datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.sweetAlert.mensajeError("Usuario Invalido");
        } else {
          this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', response); // Para objetos
          if (response["idTipoUsuario"] == 1) {
            this.router.navigate(['principal']);
            return;
          } else if (response["idTipoUsuario"] == 2) {
            this.router.navigate(['sistema']);
            return;
          } else {
            this.sweetAlert.mensajeError("Usuario Invalido");
          }
        }
      },
      (error) => {
        this.sweetAlert.mensajeError("Fallo al Iniciar Sesión");
      }
    );
  }

  iniciarSesionTokens(almacenamientoLocal : any) {
    this.valores.correo = almacenamientoLocal["correo"]
    this.valores.contraseña = almacenamientoLocal["contraseña"];
    this.datosGenerales.datosGenerales = this.valores;

    this.apiService.post('LOGIniciarSesion/', this.datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.sweetAlert.mensajeError("Usuario Invalido");
        } else {
          this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', response); // Para objetos
          if (response["idTipoUsuario"] == 1) {
            this.router.navigate(['principal']);
            return;
          } else if (response["idTipoUsuario"] == 2) {
            this.router.navigate(['sistema']);
            return;
          } else {
            this.sweetAlert.mensajeError("Usuario Invalido");
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  irRegistrar() {
    this.router.navigate(['registrar']);
  }

}
