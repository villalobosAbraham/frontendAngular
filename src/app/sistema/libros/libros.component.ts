import { Component } from '@angular/core';
import { BarraSistemaComponent } from '../barra-sistema/barra-sistema.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { Router } from '@angular/router';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { windowWhen } from 'rxjs';
import { CommonModule } from '@angular/common';

declare var $: any;
import 'select2';

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

interface Autor {
  0 : number,
  1 : string,
  2 : string,
  3 : string,
}

interface Genero {
  0 : number,
  1 : string,
}

interface Editorial {
  0 : number,
  1 : string,
}

interface Idioma {
  0 : number,
  1 : string,
}
@Component({
  selector: 'app-libros',
  standalone : true,
  imports: [BarraSistemaComponent, FormsModule, CommonModule],
  templateUrl: './libros.component.html',
  styleUrl: './libros.component.css'
})
export class LibrosComponent {
  constructor(private Router : Router, private AlmacenamientoLocalService : AlmacenamientoLocalService, private SweetAlertService : SweetAlertService, private ApiService : ApiService) {}
  tabla : any = "";
  titulo : string = "";
  paginas : any = "";
  ISBN : any = "";
  sinopsis : string = "";
  precioBase : any = 0;
  descuento : any = 0;
  iva : any = 0;
  total : any = 0;
  portada : any =  "";
  tituloEditar : string = "";
  paginasEditar : any = "";
  ISBNEditar : any = "";
  sinopsisEditar : string = "";
  precioBaseEditar : any = 0;
  descuentoEditar : any = 0;
  ivaEditar : any = 0;
  totalEditar : any = 0;
  portadaEditar : any =  "";
  

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
      "pageLength": 10,
      "lengthChange": true,
      "destroy": true,
      "autoWidth": true,
      "scrollY": "",
    });
    $('#fechaPublicacion, #fechaPublicacionEditar').datepicker({
      dateFormat: 'dd/mm/yy',
      autoclose: true,
      todayHighlight: true,
      locale: "es"
    });
    $("#autores").select2();


    this.obtenerAutores();
    this.obtenerLibros();
    this.obtenerAutoresActivos();
    this.obtenerGenerosActivos();
    this.obtenerEditoralesActivas();
    this.obtenerIdiomasActivos();
  }

  obtenerAutores() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();

    this.ApiService.post('ADMObtenerAutores/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          return;
        } 
        let autores : Autor[] = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        autores.forEach((autor: Autor) => {
          let optionAutor = $("<option>").attr("value", autor[0]).text(autor[1] + " " + autor[2] + " " + autor[3]);
          $("#autores").append(optionAutor);
        });
      },
      (error) => {
      }
    );
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
    imagen.src = "http://127.0.0.1:8000/media/" + rutaPortada;
    imagen.style.cssText = "max-height : 150px";

    return imagen;
  }

  obtenerAutoresActivos() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();

    this.ApiService.post('ADMObtenerAutoresActivos/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          return;
        } 
        let autores : Autor[] = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        autores.forEach((autor: Autor) => {
          let optionAutor = $("<option>").attr("value", autor[0]).text(autor[1] + " " + autor[2] + " " + autor[3]);
          $("#autor, #autorEditar").append(optionAutor);
        });
      },
      (error) => {
      }
    );
  }

  obtenerGenerosActivos() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();

    this.ApiService.post('ADMObtenerGenerosActivos/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          return;
        } 
        let generos : Genero[] = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        generos.forEach((genero: Genero) => {
          let optionGenero = $("<option>").attr("value", genero[0]).text(genero[1]);
          $("#genero, #generoEditar").append(optionGenero);
        });
      },
      (error) => {
      }
    );
  }

  obtenerEditoralesActivas() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();

    this.ApiService.post('ADMObtenerEditorialesActivos/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          return;
        } 
        let editoriales : Editorial[] = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        editoriales.forEach((editorial: Editorial) => {
          let optionEditorial = $("<option>").attr("value", editorial[0]).text(editorial[1]);
          $("#editorial, #editorialEditar").append(optionEditorial);
        });
      },
      (error) => {
      }
    );
  }

  obtenerIdiomasActivos() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();

    this.ApiService.post('ADMObtenerIdiomasActivos/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          return;
        } 
        let idiomas : Idioma[] = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        idiomas.forEach((idioma: Idioma) => {
          let optionIdioma = $("<option>").attr("value", idioma[0]).text(idioma[1]);
          $("#idioma, #idiomaEditar").append(optionIdioma);
        });
      },
      (error) => {
      }
    );
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
  
  calcularCostos() {
    if (this.descuento > this.precioBase) {
      this.descuento = this.precioBase - 1;;
    }
    this.iva = (this.precioBase - this.descuento) * 0.16;
    this.total = this.precioBase - this.descuento + this.iva;
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.portada = input.files[0];
    }
  }

  abrirModalConfirmarAgregar() {
    if (!this.comprobarDatosAgregar()) {
      return;
    }
    Swal.fire({
      title: "Estas Seguro?",
      text: "Confirmar Agregar Libro",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Agregar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.agregarLibro();
      }
    });
  }

  comprobarDatosAgregar() {
    let fechaPublicacion = $("#fechaPublicacion").val();
    if (this.titulo == "") {
      this.SweetAlertService.mensajeError("Titulo Vacio");
      return false;
    } else if (this.paginas <= 0 || this.paginas == "") {
      this.SweetAlertService.mensajeError("Paginas Erroneas");
      return false;
    } else if (fechaPublicacion == "") {
      this.SweetAlertService.mensajeError("Fecha de Publicacion Erronea");
      return false;
    } else if (this.sinopsis == "") {
      this.SweetAlertService.mensajeError("Falta Sinopsis");
      return false;
    } else if (this.precioBase <= 0 || this.paginas == "") {
      this.SweetAlertService.mensajeError("Precio Base Incorrecto");
      return false;
    } else if (this.descuento <= -1 || this.descuento > this.precioBase) {
      this.SweetAlertService.mensajeError("Descuento Incorrecto");
      return false;
    } else if (this.iva >= this.precioBase) {
      this.SweetAlertService.mensajeError("Fallo de Calculo de Iva, Reiniciando Pagina");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else if (this.total <= -1) {
      this.SweetAlertService.mensajeError("Fallo de Calculo de Total, Reiniciando Pagina");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else if (this.portada == "") {
      this.SweetAlertService.mensajeError("Imagen no Seleccionada");
      return false;
    }

    return true;
  }

  agregarLibro() {
    let datosGenerales = this.prepararDatosGeneralesAgregarLibro();

    // this.SweetAlertService.cargando();
    this.ApiService.post('ADMAgregarLibroCatalogo/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Agregar el Libro");
          setTimeout(() => {
            $("#modal").modal("hide");
            this.obtenerLibros();
          }, 3000);
          return;
        } 
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Libro Agregado con Exito");
        setTimeout(() => {
          $("#modal").modal("hide");
          this.obtenerLibros();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          $("#modal").modal("hide");
          this.obtenerLibros();
        }, 3000);
      }
    );
  }

  prepararDatosGeneralesAgregarLibro() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let idGenero = $("#genero").val();
    let fecha = $("#fechaPublicacion").val().split("/").reverse().join("-");
    let idIdioma = $("#idioma").val();
    let idAutor = $("#autor").val();
    let idEditorial = $("#editorial").val();

    const formData = new FormData();
    formData.append('portada', this.portada);

    // Agrega los demás datos al FormData
    formData.append('titulo', this.titulo.toString());
    formData.append('precio', this.precioBase.toString());
    formData.append('descuento', this.descuento.toString());
    formData.append('iva', this.iva.toString());
    formData.append('idGenero', idGenero.toString());
    formData.append('sinopsis', this.sinopsis);
    formData.append('paginas', this.paginas.toString());
    formData.append('idIdioma', idIdioma.toString());
    formData.append('idEditorial', idEditorial.toString());
    formData.append('fechaPublicacion', fecha.toString());
    formData.append('idAutor', idAutor.toString());
    formData.append('ISBN', this.ISBN.toString());

    formData.append('token', JSON.stringify(token)); // Serializa el token);

    return formData;
  }

  abrirModalEditarLibro() {
    let seleccionado = $('input[name="opcionLibro"]:checked');
    if (seleccionado.length <= 0) {
      this.SweetAlertService.mensajeError("Seleccione un Libro para Editar");
      return;
    }
    let datosGenerales = this.prepararDatosGeneralesObtenerLibroEdicion();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMObenerLibroEdicion/', datosGenerales).subscribe(
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
        this.tituloEditar = response[0];
        this.paginasEditar = response[7];
        this.ISBNEditar = response[8];
        this.sinopsisEditar = response[6];
        this.precioBaseEditar = response[1];
        this.descuentoEditar = response[2];

        $("#autorEditar").val(response[9]);
        $("#generoEditar").val(response[12]);
        $("#editorialEditar").val(response[10]);
        $("#idiomaEditar").val(response[11]);
        $("#fechaPublicacionEditar").val(response[4].split("-").reverse().join("/"));

        $("#portadaVieja").attr("src", "http://127.0.0.1:8000/media/" + response[5]).css("max-height", "150px");
        this.calcularCostosEditar();

        $("#modalEditar").modal("show");
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

  prepararDatosGeneralesObtenerLibroEdicion() {
    let idLibroEdicion = $('input[name="opcionLibro"]:checked').attr('idLibro');

    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);

    let datosGeneralesAntesEncapsular = {
      idLibro : idLibroEdicion,
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

  calcularCostosEditar() {
    if (this.descuentoEditar > this.precioBaseEditar) {
      this.descuentoEditar = this.precioBaseEditar - 1;
    }
    this.ivaEditar = (this.precioBaseEditar - this.descuentoEditar) * 0.16;
    this.totalEditar = this.precioBaseEditar - this.descuentoEditar + this.ivaEditar;
  }

  seleccionarImagenEditar(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.portadaEditar = input.files[0];
    }
  }

  abrirModalConfirmarEditar() {
    if (!this.comprobarDatosEditar()) {
      return;
    }

    Swal.fire({
      title: "Estas Seguro?",
      text: "Confirmar Agregar Libro",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Agregar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.editarLibro();
      }
    });
  }

  comprobarDatosEditar() {
    let fechaPublicacion = $("#fechaPublicacionEditar").val();
    if (this.tituloEditar == "") {
      this.SweetAlertService.mensajeError("Titulo Vacio");
      return false;
    } else if (this.paginasEditar <= 0 || this.paginasEditar == "") {
      this.SweetAlertService.mensajeError("Paginas Erroneas");
      return false;
    } else if (fechaPublicacion == "") {
      this.SweetAlertService.mensajeError("Fecha de Publicacion Erronea");
      return false;
    } else if (this.sinopsisEditar == "") {
      this.SweetAlertService.mensajeError("Falta Sinopsis");
      return false;
    } else if (this.precioBaseEditar <= 0 || this.paginasEditar == "") {
      this.SweetAlertService.mensajeError("Precio Base Incorrecto");
      return false;
    } else if (this.descuentoEditar <= -1 || this.descuentoEditar > this.precioBaseEditar) {
      this.SweetAlertService.mensajeError("Descuento Incorrecto");
      return false;
    } else if (this.ivaEditar >= this.precioBaseEditar) {
      this.SweetAlertService.mensajeError("Fallo de Calculo de Iva, Reiniciando Pagina");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else if (this.totalEditar <= -1) {
      this.SweetAlertService.mensajeError("Fallo de Calculo de Total, Reiniciando Pagina");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else if (this.portadaEditar == "") {
      this.SweetAlertService.mensajeError("Imagen no Seleccionada");
      return false;
    }

    return true;
  }

  editarLibro() {
    let datosGenerales = this.prepararDatosGeneralesEditarLibro();

    this.ApiService.post('ADMEditarLibroCatalogo/', datosGenerales).subscribe(
      (response : any) => {
        if (response == false) {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo al Editar el Libro");
          setTimeout(() => {
            $("#modalEditar").modal("hide");
            this.obtenerLibros();
          }, 3000);
          return;
        } 
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeFunciono("Libro Editado con Exito");
        setTimeout(() => {
          $("#modalEditar").modal("hide");
          this.obtenerLibros();
        }, 3000);
      },
      (error) => {
        this.SweetAlertService.close();
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
        setTimeout(() => {
          $("#modalEditar").modal("hide");
          this.obtenerLibros();
        }, 3000);
      }
    );
  }

  prepararDatosGeneralesEditarLibro() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);

    let idLibro = $('input[name="opcionLibro"]:checked').attr('idLibro');
    let idGenero = $("#generoEditar").val();
    let fecha = $("#fechaPublicacionEditar").val().split("/").reverse().join("-");
    let idIdioma = $("#idiomaEditar").val();
    let idAutor = $("#autorEditar").val();
    let idEditorial = $("#editorialEditar").val();

    const formData = new FormData();
    formData.append('idLibro', idLibro);
    formData.append('portada', this.portadaEditar);

    // Agrega los demás datos al FormData
    formData.append('titulo', this.tituloEditar.toString());
    formData.append('precio', this.precioBaseEditar.toString());
    formData.append('descuento', this.descuentoEditar.toString());
    formData.append('iva', this.ivaEditar.toString());
    formData.append('idGenero', idGenero.toString());
    formData.append('sinopsis', this.sinopsisEditar);
    formData.append('paginas', this.paginasEditar.toString());
    formData.append('idIdioma', idIdioma.toString());
    formData.append('idEditorial', idEditorial.toString());
    formData.append('fechaPublicacion', fecha.toString());
    formData.append('idAutor', idAutor.toString());
    formData.append('ISBN', this.ISBNEditar.toString());

    formData.append('token', JSON.stringify(token)); // Serializa el token);

    return formData;
  }
}
