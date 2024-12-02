import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';

@Component({
  selector: 'app-barra-usuario',
  imports: [],
  templateUrl: './barra-usuario.component.html',
  styleUrl: './barra-usuario.component.css'
})
export class BarraUsuarioComponent {
  constructor(private apiService: ApiService, private router: Router, private sweetAlert : SweetAlertService, private AlmacenamientoLocalService : AlmacenamientoLocalService) {}

  
}
