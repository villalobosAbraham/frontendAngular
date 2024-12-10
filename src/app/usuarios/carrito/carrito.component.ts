import { Component, ViewChild } from '@angular/core';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Router } from '@angular/router';
import { BarraUsuarioComponent } from '../barra-usuario/barra-usuario.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { LibroComponent } from "../libro/libro.component";
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrito',
  imports: [BarraUsuarioComponent, CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {

}
