import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    this.apiService.post('LOGComprobarUsuario/').subscribe(
      (response) => {
        console.log('Respuesta del backend:', response);
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
}
