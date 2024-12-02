import { Component } from '@angular/core';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Router } from '@angular/router';
import { BarraUsuarioComponent } from '../barra-usuario/barra-usuario.component';

@Component({
  selector: 'app-principal',
  imports: [BarraUsuarioComponent],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent {
  constructor(private router : Router, private sweetAlert : SweetAlertService) {};
  token : any; 
  tokenData: any;
  ngOnInit() {
    this.token = localStorage.getItem('clave');
    if (!this.token) {
      this.router.navigate(['/login']);
    }
  }
}
