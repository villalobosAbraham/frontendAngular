import { Component } from '@angular/core';
import { BarraSistemaComponent } from '../barra-sistema/barra-sistema.component';
import { ApiService } from '../../services/api.service';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

declare var $: any;

interface Venta {
  0 : number,
  1 : string,
  2 : string,
  3 : number,
  4 : number,
  5 : number,
  6 : string, 
  7 : string,
  8 : string,
  9 : string,
  10 : string
}

interface Detalle {
  0 : number,
  1 : string,
  2 : number,
  3 : number,
  4 : number,
  5 : number,
  6 : string, 
  7 : string,
  8 : string,
  9 : string,
  10 : string,
  11 : string, 
  12 : string,
  13 : string,
}

@Component({
  selector: 'app-ventas',
  standalone : true,
  imports: [BarraSistemaComponent],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent {
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
  
      this.tabla = $('#tablaVentas, #tablaDetalles').DataTable({
        "pageLength": 5,
        "lengthChange": true,
        "destroy": true,
        "autoWidth": true,
        "scrollY": "",
      });

      this.obtenerVentas();
    }

    obtenerVentas() {
      let datosGenerales = this.prepararDatosGeneralesSoloToken();
      if (!datosGenerales) {
        return;
      }
  
      this.SweetAlertService.cargando();
      this.ApiService.post('ADMObtenerVentas/', datosGenerales).subscribe(
        (response : any) => {
          if (typeof response === 'boolean') {
            this.SweetAlertService.close();
            this.SweetAlertService.mensajeError("Fallo en la Obtencion del Historial de Ventas");
            return;
          } 
          let ventas : Venta[] = response;
          this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
          this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
          this.mostrarVentas(ventas);
          this.SweetAlertService.close();
        },
        (error) => {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo de Conexion del Servidor");

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

  mostrarVentas(ventas : Venta[]) {
    this.tabla.clear();
    ventas.forEach((venta: Venta) => {
      let action = document.createElement('button');
      action.textContent = 'Detalles';
      action.className = 'btn btn-primary';
      action.style.cssText = 'display:flex; align-items:center; justify-content:center; min-width: 30px; min-height: 30px;';
      action.title = 'Detalles Compra';
      action.addEventListener('click', () => this.abrirModalDetalles(venta[0]));
      let usuario = venta[7] + " " + venta[8] + " " + venta[9];
      let estado = this.prepararEstadoRecogida(venta);

      let fila = this.tabla.row.add([
        venta[0], // Primer elemento de la compra
        venta[6], // Otro valor
        venta[1].split("-").reverse().join("/"), // Formato de fecha
        usuario,
        "$" + venta[2], // Último valor a mostrar en la fila
        estado,
        action
      ]).draw().node();
  
    });

    this.tabla.draw();
  }

  abrirModalDetalles(idVenta : any) {
    let datosGenerales = this.prepararDatosGeneralesPrepararVenta(idVenta);

    this.SweetAlertService.cargando();
      this.ApiService.post('ADMObtenerVenta/', datosGenerales).subscribe(
        (response : any) => {
          if (typeof response === 'boolean') {
            this.SweetAlertService.close();
            this.SweetAlertService.mensajeError("Fallo en la Obtencion del Historico de Ventas");
            return;
          } 
          // let ventas : Venta[] = response;
          // this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
          // this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
          // this.mostrarVentas(ventas);
          // this.SweetAlertService.close();
        },
        (error) => {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo de Conexion del Servidor");

        }
      );
  }

  prepararDatosGeneralesPrepararVenta(idVenta : any) {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGeneralesAntesEncapsular = {
      idVenta : idVenta,
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

  prepararEstadoRecogida(venta : Venta) {
    if (venta[5] == 1) {
      let action = document.createElement('button');
      action.textContent = 'Entregar';
      action.className = 'btn btn-primary';
      action.style.cssText = 'display:flex; align-items:center; justify-content:center; min-width: 30px; min-height: 30px;';
      action.title = 'Detalles Compra';
      action.addEventListener('click', () => this.abrirConfirmarEntregar(venta[0]));

      return action;
    } else {
      return venta[10];
    }
  }

  abrirConfirmarEntregar(idVenta : any) {
    Swal.fire({
      title: "Estas Seguro?",
      text: "Se Marcara Como Entregado Toda la Venta",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Entregar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.entregarVenta(idVenta);
      }
    });
  }

  entregarVenta(idVenta : any) {
    let datosGenerales = this.prepararDatosGeneralesEntregarVenta(idVenta);

    this.SweetAlertService.cargando();
      this.ApiService.post('ADMEntregarVenta/', datosGenerales).subscribe(
        (response : any) => {
          if (response == false) {
            this.SweetAlertService.close();
            this.SweetAlertService.mensajeError("Fallo en la Obtencion del Historial de Ventas");
            return;
          } 
          this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
          this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeFunciono("Libro Entregado Correctamente");
          this.obtenerVentas();
        },
        (error) => {
          this.SweetAlertService.close();
          this.SweetAlertService.mensajeError("Fallo de Conexion del Servidor");
        }
      );
  }

  prepararDatosGeneralesEntregarVenta(idVenta : any) {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);
    let datosGeneralesAntesEncapsular = {
      idVenta : idVenta,
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
