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

interface Inventario {
  0 : number,
  1 : string,
  2 : number,
  3 : number,
  4 : number,
  5 : string,
  6 : number, 
  7 : string,
  8 : string,
  9 : number, 
  10 : string,
}

interface Detalles {
  0 : number,
  1 : string,
  2 : number,
}
@Component({
  selector: 'app-inventario',
  imports: [BarraSistemaComponent, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent {
constructor(private Router : Router, private AlmacenamientoLocalService : AlmacenamientoLocalService, private SweetAlertService : SweetAlertService, private ApiService : ApiService) {}
  tabla : any = "";
  libro : any = "";
  inventarioAnterior : any = "";

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

    this.tabla = $('#tablaInventario').DataTable({
      "pageLength": 10,
      "lengthChange": true,
      "destroy": true,
      "autoWidth": true,
      "scrollY": "",
    });
    this.obtenerInventario();
    
  }

  obtenerInventario() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMObtenerInventarioLibros/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo De Obtencion de Inventario, Se Cerrara Sesion");
          setTimeout(() => {
            this.Router.navigate(['login']);
          }, 3000);
          return;
        } 
        let inventarios : Inventario[] = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.mostrarInventario(inventarios);
        this.SweetAlertService.close();
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion con el Servidor, Se Cerrara Sesion");
        setTimeout(() => {
          this.Router.navigate(['login']);
        }, 3000);
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

  mostrarInventario(inventarios : Inventario[]) {
    this.tabla.clear();
    inventarios.forEach((inventario: Inventario) => {
      let action = this.prepararRadioButon(inventario[0]);
      let activo = this.prepararActivoLibro(inventario[7]);
      let portada = this.prepararPortada(inventario[5]);
      let fila = this.tabla.row.add([
        action, // Primer elemento de la compra
        portada, // Formato de fecha
        inventario[1], // Concatenar campos
        inventario[8], // Otro valor
        inventario[9], // Último valor a mostrar en la fila
        inventario[10], // Último valor a mostrar en la fila
        inventario[6], // Último valor a mostrar en la fila
        activo, // Último valor a mostrar en la fila
      ]).node();
    });
    this.tabla.draw();
  }

  prepararRadioButon(idLibro : any) {
    let radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = "opcionInventarioLibro";
    radioInput.setAttribute('idLibro', idLibro);

    return radioInput
  }

  prepararActivoLibro(activo : any) {
    return (activo == "S") ? "Si" : "No";
  }

  prepararPortada(rutaPortada : string) {
    let imagen = document.createElement('img');
    imagen.src = "http://127.0.0.1:8000/media/" + rutaPortada;
    imagen.style.cssText = "max-height : 150px";

    return imagen;
  }

  confirmarDesHabilitarInventario() : any {
    let seleccionado = $('input[name="opcionInventarioLibro"]:checked');
    if (seleccionado.length <= 0) {
      return false;
    }
    let idLibro = $('input[name="opcionInventarioLibro"]:checked').attr('idLibro');
    Swal.fire({
      title: "Estas Seguro?",
      text: "Confirmar Deshabilitar Inventario del Libro",
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
    this.ApiService.post('ADMDeshabilitarInventario/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Deshabilitar el Inventario del Libro");
          setTimeout(() => {
            this.obtenerInventario();
          }, 3000);
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Inventario del Libro Deshabilitado con Exito");
        setTimeout(() => {
          this.obtenerInventario();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerInventario();
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

  confirmarHabilitarInventario() : any {
    let seleccionado = $('input[name="opcionInventarioLibro"]:checked');
    if (seleccionado.length <= 0) {
      return false;
    }
    let idLibro = $('input[name="opcionInventarioLibro"]:checked').attr('idLibro');
    Swal.fire({
      title: "Estas Seguro?",
      text: "Confirmar Habilitar Inventario del Libro",
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
    this.ApiService.post('ADMHabilitarInventario/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Habilitar el Inventario del Libro");
          setTimeout(() => {
            this.obtenerInventario();
          }, 3000);
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Inventario del Libro Habilitado con Exito");
        setTimeout(() => {
          this.obtenerInventario();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerInventario();
        }, 3000);
      }
    );
  }

  obtenerInformacionInventario() {
    let datosGenerales = this.prepararDatosGeneralesObtenerInformacion();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMObtenerDatosInventarioLibro/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo Obtener el Inventario del Libro");
          setTimeout(() => {
            this.obtenerInventario();
          }, 3000);
        } 
        let detalles : Detalles = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.mostrarModal(detalles);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          this.obtenerInventario();
        }, 3000);
      }
    );
  }

  prepararDatosGeneralesObtenerInformacion() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let seleccionado = $('input[name="opcionInventarioLibro"]:checked');
    if (seleccionado.length <= 0) {
      this.SweetAlertService.mensajeError("Falta Seleccionar el Inventario de un Libro");
      return false;
    }
    let idLibro = $('input[name="opcionInventarioLibro"]:checked').attr('idLibro');
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

  mostrarModal(detalle : Detalles) {
    $("#modal").modal("show");
    this.libro = detalle[1];
    this.inventarioAnterior = detalle[2];
  }

  abrirModalConfirmarAgregar() {
    let nuevoInventario = $("#inventarioNuevo").val();
    if (nuevoInventario <= -1 || !nuevoInventario) {
      this.SweetAlertService.mensajeError("Numero Invalido");
      return;
    }
    Swal.fire({
      title: "Estas Seguro?",
      text: "Confirmar Modificar Inventario del Libro",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Modificar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.modificarInventario(nuevoInventario);
      }
    });
  }

  modificarInventario(nuevoInventario : any) {
    let datosGenerales = this.preparardatosGeneralesModificarInventario(nuevoInventario);
    if (!datosGenerales) {
      return;
    }

    this.ApiService.post('ADMModificarInventarioLibro/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Modifcar del Libro");
          setTimeout(() => {
            this.obtenerInventario();
            $("#modal").modal("hide");
          }, 3000);
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Inventario Modificado Correctamente");
        $("#modal").modal("hide");
        setTimeout(() => {
          this.obtenerInventario();
        }, 3000);

      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          $("#modal").modal("hide");
          this.obtenerInventario();
        }, 3000);
      }
    );
  }

  preparardatosGeneralesModificarInventario(nuevoInventario : any) {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let seleccionado = $('input[name="opcionInventarioLibro"]:checked');
    if (seleccionado.length <= 0) {
      this.SweetAlertService.mensajeError("Fallo en preparacion de Modificar");
      return false;
    }
    let idLibro = $('input[name="opcionInventarioLibro"]:checked').attr('idLibro');
    let datosGeneralesAntesEncapsular = {
      idLibro : idLibro,
      cantidad : nuevoInventario,
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
}
