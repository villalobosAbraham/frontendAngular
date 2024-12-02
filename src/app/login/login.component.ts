import { Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../services/sweet-alert.service';

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
  constructor(private apiService: ApiService, private router: Router, private sweetAlert : SweetAlertService) {}
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
    // Verifica si ya estás en la ruta '/login'
    this.apiService.post('LOGComprobarUsuario/').subscribe(
      (response) => {
        this.respuesta = response as boolean;
        if (this.respuesta) {
          this.router.navigate(['/principal']);
        } 
      },
      (error) => {
      }
    );
  }

  iniciarSesion() {
    this.valores.correo = this.correo.nativeElement.value;
    this.valores.contraseña = this.contraseña.nativeElement.value;
    this.datosGenerales.datosGenerales = this.valores
    
    this.apiService.post('LOGIniciarSesion/', this.datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          this.sweetAlert.mensajeError("Usuario Invalido");
        } else {
          localStorage.setItem('clave', JSON.stringify(response)); // Para objetos
          this.router.navigate(['/principal']);
        }
      },
      (error) => {
      }
    );
  }
}
