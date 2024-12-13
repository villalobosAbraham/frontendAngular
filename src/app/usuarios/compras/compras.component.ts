import { Component } from '@angular/core';
import { BarraUsuarioComponent } from '../barra-usuario/barra-usuario.component';
import { ApiService } from '../../services/api.service';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { SweetAlertService } from '../../services/sweet-alert.service';

declare var $: any;

interface Compra {
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
  1 : number,
  2 : number,
  3 : number,
  4 : number,
  5 : number,
  6 : string, 
  7 : string,
}

@Component({
  selector: 'app-compras',
  standalone : true,
  imports: [BarraUsuarioComponent],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent {
  constructor(private ApiService : ApiService, private AlmacenamientoLocalService : AlmacenamientoLocalService, private SweetAlertService : SweetAlertService) {}
  tabla : any = "";
  tablaDetalles : any = "";

  ngOnInit() {
    this.tabla = $('#tablaCompras').DataTable({
      "pageLength": 10,
      "lengthChange": false,
      "destroy": true,
      "autoWidth": true,
      "scrollY": "",
    });
    this.tablaDetalles = $('#tablaDetalles').DataTable({
      "pageLength": 5,
      "lengthChange": false,
      "destroy": true,
      "autoWidth": true,
      "scrollY": "",
      "searching" : false,
    });

    this.obtenerCompras();
  }

  obtenerCompras() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('VENObtenerVentasUsuario/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          return;
        } 
        let compras : Compra[] = response;
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.mostrarTabla(compras);
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

  mostrarTabla(compras : Compra[]) { //
    this.tabla.clear();
    compras.forEach((compra: Compra) => {
      let action = document.createElement('button');
      action.textContent = 'Detalles';
      action.className = 'btn btn-primary';
      action.style.cssText = 'display:flex; align-items:center; justify-content:center; min-width: 30px; min-height: 30px;';
      action.title = 'Detalles Compra';
      action.addEventListener('click', () => this.abrirModalDetalles(compra[0]));
      let fila = this.tabla.row.add([
        compra[0], // Primer elemento de la compra
        compra[1].split("-").reverse().join("/"), // Formato de fecha
        compra[10], // Concatenar campos
        compra[6], // Otro valor
        compra[2], // Último valor a mostrar en la fila
        action
      ]).draw().node();
  
    });

    this.tabla.draw();
  }
  
  abrirModalDetalles(idVenta : number) {
    let datosGenerales = this.prepararDatosGeneralesObtenerDetallesVenta(idVenta);

    this.SweetAlertService.cargando();
    this.ApiService.post('VENObtenerDetallesVenta/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          return;
        }
        let detalles : Detalle[] = response;
        this.mostrarDetalles(detalles); 
        $("#modalDetalles").modal("show");
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.SweetAlertService.close();
      },
      (error) => {
        this.SweetAlertService.close();
      }
    );
  }

  prepararDatosGeneralesObtenerDetallesVenta(idVenta : number) {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);

    let datos = {
      idVenta : idVenta,
    };

    let datosGeneralesTokenDatos = {
      token : token,
      datosGenerales : datos,
    }
    
    let datosGenerales : datosGeneralesEncapsulado = {
      datosGenerales : datosGeneralesTokenDatos
    };

    return datosGenerales;
  }

  mostrarDetalles(detalles : Detalle[]) {
    this.tablaDetalles.clear();
    detalles.forEach((detalle: Detalle) => {
      let imagen = document.createElement('img');
      imagen.src = detalle[7];
      imagen.style.cssText = "max-height : 150px";
      let fila = this.tablaDetalles.row.add([
        imagen,
        detalle[6],
        detalle[1],
        "$" + parseFloat(detalle[5].toFixed(2)) 
      ]).draw().node();
  
    });

    this.tablaDetalles.draw();
  }
}
