import { Component } from '@angular/core';
import { BarraSistemaComponent } from '../barra-sistema/barra-sistema.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { Router } from '@angular/router';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2';
declare var $: any;

interface Autor {
  0 : number,
  1 : string,
  2 : string,
  3 : string,
  4 : string,
  5 : number,
  6 : string, 
  7 : string,
}

@Component({
  selector: 'app-autores',
  standalone : true,
  imports: [BarraSistemaComponent],
  templateUrl: './autores.component.html',
  styleUrl: './autores.component.css'
})
export class AutoresComponent {
  constructor(private Router : Router, private AlmacenamientoLocalService : AlmacenamientoLocalService, private SweetAlertService : SweetAlertService, private ApiService : ApiService) {}
  tabla : any = "";

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
  
      this.tabla = $('#tablaAutores').DataTable({
        "pageLength": 10,
        "lengthChange": true,
        "destroy": true,
        "autoWidth": true,
        "scrollY": "",
      });
      $('#fechaNacimiento').datepicker({
        dateFormat: 'dd/mm/yy',
        autoclose: true,
        todayHighlight: true,
        locale: "es"
      });
      this.obtenerAutores();
    }

    obtenerAutores() {
      let datosGenerales = this.prepararDatosGeneralesSoloToken();
      if (!datosGenerales) {
        return;
      }
  
      this.SweetAlertService.cargando();
      this.ApiService.post('ADMObtenerAutores/', datosGenerales).subscribe(
        (response : any) => {
          if (typeof response === 'boolean') {
            this.SweetAlertService.close();
            return;
          } 
          let autores : Autor[] = response;
          this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
          this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
          this.mostrarAutores(autores);
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
  
    mostrarAutores(autores : Autor[]) {
      this.tabla.clear();
      autores.forEach((autor: Autor) => {
        let action = this.prepararRadioButon(autor[0]);
        let activo = this.prepararActivoAutor(autor[6]);
        let fila = this.tabla.row.add([
          action, // Primer elemento de la compra
          autor[1], // Formato de fecha
          autor[2], // Concatenar campos
          autor[3], // Otro valor
          autor[4].split("-").reverse().join("/"), 
          autor[7], // Último valor a mostrar en la fila
          activo, // Último valor a mostrar en la fila
        ]).node();
      });
      this.tabla.draw();
    }
  
    prepararRadioButon(idAutor : any) {
      let radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.name = "opcionAutor";
      radioInput.setAttribute('idAutor', idAutor);
  
      return radioInput
    }
  
    prepararActivoAutor(activo : any) {
      return (activo == "S") ? "Si" : "No";
    }
  
    confirmarHabilitarAutor() : any {
      let seleccionado = $('input[name="opcionAutor"]:checked');
      if (seleccionado.length <= 0) {
        return false;
      }
      let idAutor = $('input[name="opcionAutor"]:checked').attr('idAutor');
      Swal.fire({
        title: "Estas Seguro?",
        text: "Confirmar Habilitar Autor",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Habilitar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.habilitarAutor(idAutor);
        }
      });
    }
  
    habilitarAutor(idAutor : any) {
      let datosGenerales = this.prepararDatosGeneralesHabilitarDesHabilitarAutor(idAutor);
      if (!datosGenerales) {
        return;
      }
  
      this.SweetAlertService.cargando();
      this.ApiService.post('ADMHabilitarAutor/', datosGenerales).subscribe(
        (response : any) => {
          if (response == false) {
            this.SweetAlertService.close();
            this.SweetAlertService.mensajeError("Fallo al Habilitar al Autor");
            setTimeout(() => {
              this.obtenerAutores();
            }, 3000);
          } 
          this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
          this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeFunciono("Autor Habilitado con Exito");
          setTimeout(() => {
            this.obtenerAutores();
          }, 3000);
        },
        (error) => {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
          setTimeout(() => {
            this.obtenerAutores();
          }, 3000);
        }
      );
    }
  
    prepararDatosGeneralesHabilitarDesHabilitarAutor(idAutor : any) {
      let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
      token = this.AlmacenamientoLocalService.actualizarToken(token);
      let datosGeneralesAntesEncapsular = {
        idAutor : idAutor,
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
  
    confirmarDesHabilitarAutor() : any {
      let seleccionado = $('input[name="opcionAutor"]:checked');
      if (seleccionado.length <= 0) {
        return false;
      }
      let idAutor = $('input[name="opcionAutor"]:checked').attr('idAutor');
      Swal.fire({
        title: "Estas Seguro?",
        text: "Confirmar Deshabilitar Libro",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Deshabilitar"
      }).then((result) => {
        if (result.isConfirmed) {
          this.desHabilitarAutor(idAutor);
        }
      });
    }
  
    desHabilitarAutor(idLibro : any) {
      let datosGenerales = this.prepararDatosGeneralesHabilitarDesHabilitarAutor(idLibro);
      if (!datosGenerales) {
        return;
      }
  
      this.SweetAlertService.cargando();
      this.ApiService.post('ADMDeshabilitarAutor/', datosGenerales).subscribe(
        (response : any) => {
          if (response == false) {
            this.SweetAlertService.close();
            this.SweetAlertService.mensajeError("Fallo al Deshabilitar al Autor");
            setTimeout(() => {
              this.obtenerAutores();
            }, 3000);
            return;
          } 
          this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
          this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeFunciono("Autor Deshabilitado con Exito");
          setTimeout(() => {
            this.obtenerAutores();
          }, 3000);
        },
        (error) => {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
          setTimeout(() => {
            this.obtenerAutores();
          }, 3000);
        }
      );
    }
  
    abrirModalAgregarAutor() {
      $("#modal").modal("show");
    }
}
