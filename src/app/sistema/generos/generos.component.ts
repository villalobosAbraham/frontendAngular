import { Component } from '@angular/core';
import { BarraSistemaComponent } from '../barra-sistema/barra-sistema.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { Router } from '@angular/router';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
declare var $: any;

interface Editorial {
  0 : number,
  1 : string,
  2 : string
}

@Component({
  selector: 'app-generos',
  standalone : true,
  imports: [BarraSistemaComponent, FormsModule],
  templateUrl: './generos.component.html',
  styleUrl: './generos.component.css'
})
export class GenerosComponent {
  constructor(private Router : Router, private AlmacenamientoLocalService : AlmacenamientoLocalService, private SweetAlertService : SweetAlertService, private ApiService : ApiService) {}
  tabla : any = "";
  nombre : string = "";

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

    this.tabla = $('#tablaGeneros').DataTable({
      "pageLength": 10,
      "lengthChange": true,
      "destroy": true,
      "autoWidth": false,
      "scrollY": "",
      "columnDefs": [
        { "width": "10%", "targets": 0 }, // Ancho del 20% para la columna 0
        { "width": "70%", "targets": 1 }, // Ancho del 30% para la columna 1
        { "width": "20%", "targets": 2 }  // Ancho del 50% para la columna 2
    ]
    });

    $('#fechaNacimiento').datepicker({
      dateFormat: 'dd/mm/yy',
      changeYear: true, // Habilita el cambio de año
      changeMonth: true, // Opcional: permite cambiar de mes
      yearRange: "c-500:c-10",
      autoclose: true,
      todayHighlight: true,
      locale: "es"
    });
    this.obtenerGeneros();
  }

  obtenerGeneros() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMObtenerGeneros/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          return;
        }

        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.mostrarGeneros(response);
        this.SweetAlertService.close();
      },
      (error) => {
        this.SweetAlertService.close();
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

  mostrarGeneros(generos : any) {
    this.tabla.clear();
    generos.forEach((genero: any) => {
      let action = this.prepararRadioButon(genero[0]);
      let activo = this.prepararActivoGenero(genero[2]);
      this.tabla.row.add([
        action, // Primer elemento de la compra
        genero[1], // Genero
        activo, // Último valor a mostrar en la fila
      ]).node();
    });
    this.tabla.draw();
  }

  prepararRadioButon(idGenerol : any) {
    let radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = "opcionGenero";
    radioInput.setAttribute('idGenero', idGenerol);
    return radioInput
  }

  prepararActivoGenero(activo : any) {
    return (activo == "S") ? "Si" : "No";
  }

  abrirModalAgregarGenero() {
    $("#modal").modal("show");
  }

  agregarGenero() {
    let datosGenerales = this.prepararDatosGeneralesAgregarGenero();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMAgregarGenero/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        // this.mostrarEditoriales(response);
        this.SweetAlertService.close();
      },
      (error) => {
        this.SweetAlertService.close();
      }
    );
  }

  prepararDatosGeneralesAgregarGenero() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);

    let datosGeneralesAntesEncapsular = {
      nombre : this.nombre,
    };

    let datosGenerales = {
      datosGenerales : datosGeneralesAntesEncapsular,
      token : token,
    }

    let datosGeneralesEncapsulados : datosGeneralesEncapsulado = {
      datosGenerales : datosGenerales
    };

    return datosGeneralesEncapsulados;
  }

  desHabilitarGenero() {
    let datosGenerales = this.prepararDatosGeneralesHabilitarDesHabilitarGenero();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMDesHabilitarGenero/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Deshabilitar el Genero");
          setTimeout(() => {
            this.obtenerGeneros();
          }, 3000);
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Genero Deshabilitado con Exito");
        setTimeout(() => {
          this.obtenerGeneros();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerGeneros();
        }, 3000);
      }
    );
  }
  
  prepararDatosGeneralesHabilitarDesHabilitarGenero() {
    let seleccionado = $('input[name="opcionGenero"]:checked');
    if (seleccionado.length <= 0) {
      return false;
    }
    let idGenero = $('input[name="opcionGenero"]:checked').attr('idGenero');
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
      token = this.AlmacenamientoLocalService.actualizarToken(token);
      let datosGeneralesAntesEncapsular = {
        idGenero : idGenero,
      };
  
      let datosGenerales = {
        datosGenerales : datosGeneralesAntesEncapsular,
        token : token,
      }
  
      let datosGeneralesEncapsulados : datosGeneralesEncapsulado = {
        datosGenerales : datosGenerales
      };
  
      return datosGeneralesEncapsulados;
  }

  habilitarGenero() {
    let datosGenerales = this.prepararDatosGeneralesHabilitarDesHabilitarGenero();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMHabilitarGenero/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Habilitar el Genero");
          setTimeout(() => {
            this.obtenerGeneros();
          }, 3000);
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Genero Habilitado con Exito");
        setTimeout(() => {
          this.obtenerGeneros();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerGeneros();
        }, 3000);
      }
    );
  }
}
