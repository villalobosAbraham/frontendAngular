import { Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

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
  constructor(private apiService: ApiService, private router: Router) {}
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
    console.log(this.router.url);
    // Verifica si ya estás en la ruta '/login'
    if (this.router.url === '/login/') {
      console.log(this.router.url)
      return;
    } else {
      this.apiService.post('LOGComprobarUsuario/').subscribe(
        (response) => {
          this.respuesta = response as boolean;
          if (this.respuesta) {
            console.log("XD");
          } else {
            // this.router.navigate(['/login'])
          }
        },
        (error) => {
        }
      );
    }
  }

  iniciarSesion() {
    this.valores.correo = this.correo.nativeElement.value;
    this.valores.contraseña = this.contraseña.nativeElement.value;
    this.datosGenerales.datosGenerales = this.valores
    
    this.apiService.post('LOGIniciarSesion/', this.datosGenerales).subscribe(
      (response) => {
        this.respuesta = response as boolean;
        if (this.respuesta) {
          console.log("Awebo Inicie Sesion");
        } else {
          console.log("Vale Pito");
        }
      },
      (error) => {
      }
    );
  }
}
