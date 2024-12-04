import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { ApiService } from '../../services/api.service';

interface datosGneeralesEncapsulado {
  datosGenerales : any
}
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
  nameChecbox : any = "checkboxGeneros";

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
    let datosGenerales : datosGneeralesEncapsulado = {
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
    $('input[name="' + this.nameChecbox + '"]').prop('checked', false);
  }
}
