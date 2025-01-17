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
  selector: 'app-editoriales',
  standalone : true,
  imports: [BarraSistemaComponent, FormsModule],
  templateUrl: './editoriales.component.html',
  styleUrl: './editoriales.component.css'
})
export class EditorialesComponent {
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

    this.tabla = $('#tablaEditoriales').DataTable({
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
    this.obtenerEditoriales();
  }
  
  obtenerEditoriales() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMObtenerEditoriales/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.mostrarEditoriales(response);
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

  mostrarEditoriales(editoriales : any) {
    this.tabla.clear();
    editoriales.forEach((autor: any) => {
      let action = this.prepararRadioButon(autor[0]);
      let activo = this.prepararActivoEditorial(autor[2]);
      this.tabla.row.add([
        action, // Primer elemento de la compra
        autor[1], // Editorial
        activo, // Último valor a mostrar en la fila
      ]).node();
    });
    this.tabla.draw();
  }

  prepararRadioButon(idEditorial : any) {
    let radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = "opcionEditorial";
    radioInput.setAttribute('idEditorial', idEditorial);
    return radioInput
  }

  prepararActivoEditorial(activo : any) {
    return (activo == "S") ? "Si" : "No";
  }

  abrirModalAgregarEditorial() {
    $("#modal").modal("show");
  }

  agregarEditorial() {
    let datosGenerales = this.prepararDatosGeneralesAgregarEditorial();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMAgregarEditorial/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.mostrarEditoriales(response);
        this.SweetAlertService.close();
      },
      (error) => {
        this.SweetAlertService.close();
      }
    );
  }

  prepararDatosGeneralesAgregarEditorial() {
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

  habilitarEditorial() {
    let datosGenerales = this.prepararDatosGeneralesHabilitarDesHabilitarEditorial();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMHabilitarEditorial/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Habilitar la Editorial");
          setTimeout(() => {
            this.obtenerEditoriales();
          }, 3000);
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Editorial Habilitada con Exito");
        setTimeout(() => {
          this.obtenerEditoriales();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerEditoriales();
        }, 3000);
      }
    );
  }

  prepararDatosGeneralesHabilitarDesHabilitarEditorial() {
    let seleccionado = $('input[name="opcionEditorial"]:checked');
    if (seleccionado.length <= 0) {
      return false;
    }
    let idEditorial = $('input[name="opcionEditorial"]:checked').attr('idEditorial');
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
      token = this.AlmacenamientoLocalService.actualizarToken(token);
      let datosGeneralesAntesEncapsular = {
        idEditorial : idEditorial,
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

  desHabilitarEditorial() {
    let datosGenerales = this.prepararDatosGeneralesHabilitarDesHabilitarEditorial();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMDesHabilitarEditorial/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Deshabilitar la Editorial");
          setTimeout(() => {
            this.obtenerEditoriales();
          }, 3000);
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Editorial Deshabilitada con Exito");
        setTimeout(() => {
          this.obtenerEditoriales();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerEditoriales();
        }, 3000);
      }
    );
  }
}
