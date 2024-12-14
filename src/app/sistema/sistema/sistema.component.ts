import { Component } from '@angular/core';
import { BarraSistemaComponent } from '../barra-sistema/barra-sistema.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sistema',
  imports: [BarraSistemaComponent],
  templateUrl: './sistema.component.html',
  styleUrl: './sistema.component.css'
})
export class SistemaComponent {
  constructor(private Router : Router, private AlmacenamientoLocalService : AlmacenamientoLocalService) {}

  ngOnInit() {
    let almacenamientoLocal = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    if (!almacenamientoLocal) {
      this.Router.navigate(['login']);
      return;
    }
    almacenamientoLocal = this.AlmacenamientoLocalService.actualizarToken(almacenamientoLocal);
    if (!almacenamientoLocal) {
      this.Router.navigate(['login']);
      return;
    }
  }
}
