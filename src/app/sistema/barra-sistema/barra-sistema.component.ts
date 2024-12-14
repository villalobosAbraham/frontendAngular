import { Component } from '@angular/core';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../services/sweet-alert.service';

@Component({
  selector: 'app-barra-sistema',
  standalone : true,
  imports: [],
  templateUrl: './barra-sistema.component.html',
  styleUrl: './barra-sistema.component.css'
})
export class BarraSistemaComponent {
  constructor(private Router : Router, private AlmacenamientoLocalService : AlmacenamientoLocalService, private SweetAlertService : SweetAlertService) {}

  cerrarSesion() {
    try {
      this.AlmacenamientoLocalService.limpiarAlmacenamientoLocal();
      this.Router.navigate(['login']);
    } catch($e) {
      this.SweetAlertService.mensajeError("Fallo al Cerrar Sesión");
    }
  }
}
