import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { FormsModule } from '@angular/forms';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { ApiService } from '../../services/api.service';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';

declare var $: any;

@Component({
  selector: 'app-libros-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libros-carrito.component.html',
  styleUrl: './libros-carrito.component.css'
})
export class LibrosCarritoComponent {
  constructor(private SweetAlertService : SweetAlertService, private ApiService : ApiService, private AlmacenamientoLocalService : AlmacenamientoLocalService) {}
  @Input() libro : any = "";
  @Output() aumentoCarrito = new EventEmitter();
  @Output() eliminarLibro = new EventEmitter();
  total : any = "";
  cantidad : any = "";
  maximo : any = "";
  ngOnInit() {
    this.cantidad = this.libro[1];
    this.total = (this.libro[3] - this.libro[4] + this.libro[5]) * this.cantidad;
    this.maximo = this.libro[8];
  }

  comprobarNuevaCantidad() {
    if (this.cantidad > this.maximo) {
      this.cantidad = this.maximo;
      this.aumentarLibroCarrito();
      this.SweetAlertService.mensajeError("Maximo de Libros Superado");

      this.total = (this.libro[3] - this.libro[4] + this.libro[5]) * this.maximo;
      let inputTotal = "totalLibro" + "" + this.libro[0];

      $("#totalLibro").val(inputTotal);
    } else if (this.cantidad <= 0) {
      this.cantidad = 1;
      this.aumentarLibroCarrito();
      this.total = this.libro[3] - this.libro[4] + this.libro[5];
      let inputTotal = "totalLibro" + "" + this.libro[0];

      $("#totalLibro").val(inputTotal);
    } else {
      this.aumentarLibroCarrito();
      this.total = (this.libro[3] - this.libro[4] + this.libro[5]) * this.cantidad;
      let inputTotal = "totalLibro" + "" + this.libro[0];

      $("#totalLibro").val(inputTotal);
    }
  }

  aumentarLibroCarrito() {
    let datosGenerales = this.prepararDatosGeneralesAumentarLibroCarrito();

    this.ApiService.post('INVActualizarCantidadLibroCarrito/', datosGenerales).subscribe(
      (response) => {
        if (response == false) {
          this.SweetAlertService.mensajeError("Fallo al Agregar el Libro");
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.aumentoCarrito.emit();
      },
      (error) => {
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
      }
    );
  }

  prepararDatosGeneralesAumentarLibroCarrito() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGeneralesAntesEncapsular = {
      idLibro : this.libro[0],
      cantidad : this.cantidad,
      idUsuario : token["idUsuario"]
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

  eliminar() {
    let datosGenerales = this.prepararDatosGeneralesEliminarCarrito();

    this.ApiService.post('INVBorrarLibroCarrito/', datosGenerales).subscribe(
      (response) => {
        if (response == false) {
          this.SweetAlertService.mensajeError("Fallo al Eliminar el Libro");
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.eliminarLibro.emit();
        this.SweetAlertService.mensajeFunciono("Libro Eliminado Correctamente");
      },
      (error) => {
        this.SweetAlertService.mensajeError("Fallo de Conexion al Servidor");
      }
    );
  }

  prepararDatosGeneralesEliminarCarrito() {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGeneralesAntesEncapsular = {
      idLibro : this.libro[0],
      idUsuario : token["idUsuario"]
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
