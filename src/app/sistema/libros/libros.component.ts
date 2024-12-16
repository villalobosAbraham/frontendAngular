import { Component } from '@angular/core';
import { BarraSistemaComponent } from '../barra-sistema/barra-sistema.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { Router } from '@angular/router';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2';

declare var $: any;

interface Libro {
  0 : number,
  1 : string,
  2 : number,
  3 : number,
  4 : number,
  5 : number,
  6 : string, 
  7 : string,
  8 : string,
  9 : number,
  10 : string,
  11 : string,
  12 : number,
  13 : string,
  14 : string,
  15 : number,
}
@Component({
  selector: 'app-libros',
  standalone : true,
  imports: [BarraSistemaComponent],
  templateUrl: './libros.component.html',
  styleUrl: './libros.component.css'
})
export class LibrosComponent {
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

    this.tabla = $('#tablaLibros').DataTable({
      "pageLength": 5,
      "lengthChange": true,
      "destroy": true,
      "autoWidth": true,
      "scrollY": "",
    });
    this.obtenerLibros();
  }

  obtenerLibros() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMObtenerLibros/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          return;
        } 
        let libros : Libro[] = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.mostrarlibros(libros);
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

  mostrarlibros(libros : Libro[]) {
    this.tabla.clear();
    libros.forEach((libro: Libro) => {
      let action = this.prepararRadioButon(libro[0]);
      let activo = this.prepararActivoLibro(libro[10]);
      let portada = this.prepararPortada(libro[7]);
      let fila = this.tabla.row.add([
        action, // Primer elemento de la compra
        libro[1], // Formato de fecha
        libro[14], // Concatenar campos
        portada,
        libro[11], // Otro valor
        libro[12], // Último valor a mostrar en la fila
        libro[13], // Último valor a mostrar en la fila
        libro[6].split("-").reverse().join("/"), // Último valor a mostrar en la fila
        libro[9], // Último valor a mostrar en la fila
        activo, // Último valor a mostrar en la fila
      ]).node();
    });
    this.tabla.draw();
  }

  prepararRadioButon(idLibro : any) {
    let radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = "opcionLibro";
    radioInput.setAttribute('idLibro', idLibro);

    return radioInput
  }

  prepararActivoLibro(activo : any) {
    return (activo == "S") ? "Si" : "No";
  }

  prepararPortada(rutaPortada : string) {
    let imagen = document.createElement('img');
    imagen.src = rutaPortada;
    imagen.style.cssText = "max-height : 150px";

    return imagen;
  }

  confirmarHabilitarLibro() : any {
    let seleccionado = $('input[name="opcionLibro"]:checked');
    if (seleccionado.length <= 0) {
      return false;
    }
    let idLibro = $('input[name="opcionLibro"]:checked').attr('idLibro');
    Swal.fire({
      title: "Estas Seguro?",
      text: "Confirmar Habilitar Libro",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Habilitar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.habilitarLibro(idLibro);
      }
    });
  }

  habilitarLibro(idLibro : any) {
    let datosGenerales = this.prepararDatosGeneralesHabilitarDesHabilitarLibro(idLibro);
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMHabilitarLibro/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Habilitar el Libro");
          setTimeout(() => {
            this.obtenerLibros();
          }, 3000);
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Libro Habilitado con Exito");
        setTimeout(() => {
          this.obtenerLibros();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerLibros();
        }, 3000);
      }
    );
  }

  prepararDatosGeneralesHabilitarDesHabilitarLibro(idLibro : any) {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGeneralesAntesEncapsular = {
      idLibro : idLibro,
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

  confirmarDesHabilitarLibro() : any {
    let seleccionado = $('input[name="opcionLibro"]:checked');
    if (seleccionado.length <= 0) {
      return false;
    }
    let idLibro = $('input[name="opcionLibro"]:checked').attr('idLibro');
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
        this.desHabilitarLibro(idLibro);
      }
    });
  }

  desHabilitarLibro(idLibro : any) {
    let datosGenerales = this.prepararDatosGeneralesHabilitarDesHabilitarLibro(idLibro);
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMDeshabilitarLibro/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Deshabilitar el Libro");
          setTimeout(() => {
            this.obtenerLibros();
          }, 3000);
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Libro Deshabilitado con Exito");
        setTimeout(() => {
          this.obtenerLibros();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerLibros();
        }, 3000);
      }
    );
  }

  abrirModalAgregarLibro() {
    $("#modal").modal("show");
  }
}
