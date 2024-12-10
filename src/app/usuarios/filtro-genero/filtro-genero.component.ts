import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { ApiService } from '../../services/api.service';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';

@Component({
  selector: 'app-filtro-genero',
  standalone : true,
  imports: [],
  templateUrl: './filtro-genero.component.html',
  styleUrl: './filtro-genero.component.css'
})
export class FiltroGeneroComponent {
  constructor(private Router : Router, private AlmacenamientoLocalService : AlmacenamientoLocalService, private ApiService : ApiService) {}
  generos : any = "";
  nameCheckbox : any = "checkboxGeneros";
  @Output() filtroLimpio = new EventEmitter();

  ngOnInit() {
    this.obtenerGeneros();
  }

  obtenerGeneros() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }
    this.ApiService.post('CONFObtenerGenerosFiltros/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          return;
        } 
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.generos = response;
      },
      (error) => {
        this.Router.navigate(['login']);
      }
    );
  }

  prepararDatosGeneralesSoloToken() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : token
    };
    
    return datosGenerales;
  }

  lineaCheckboc(id: string) {
    let checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
        checkbox.checked = !checkbox.checked; // Cambia el estado actual del checkbox
    }
  }

  limpiarFiltros() {
    $('input[name="' + this.nameCheckbox + '"]').prop('checked', false);
    this.filtroLimpio.emit();
  }

  obtenerGenerosSeleccionados() {
    let checkboxes = document.querySelectorAll<HTMLInputElement>(
      `input[name="${this.nameCheckbox}"]:checked`
    );

    // Mapear los valores de los checkboxes seleccionados a un arreglo de números
    let idsSeleccionados = Array.from(checkboxes).map((checkbox) =>
      Number(checkbox.value)
    );

    return idsSeleccionados;
  }
}
