import { Component, ViewChild } from '@angular/core';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Router } from '@angular/router';
import { BarraUsuarioComponent } from '../barra-usuario/barra-usuario.component';
import { AlmacenamientoLocalService } from '../../services/almacenamiento-local.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { datosGeneralesEncapsulado } from '../../shared/interfaces/datos-generales';
import { FormsModule } from '@angular/forms';
import { LibrosCarritoComponent } from '../libros-carrito/libros-carrito.component';

declare var paypal : any;

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [BarraUsuarioComponent, CommonModule, FormsModule, LibrosCarritoComponent],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  constructor(private Router : Router, private sweetAlert : SweetAlertService, private AlmacenamientoLocalService : AlmacenamientoLocalService, private ApiService : ApiService) {};
  @ViewChild(BarraUsuarioComponent) BarraUsuarioComponent!: BarraUsuarioComponent;
  librosCarrito : any = "";
  totales : any = "";

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

    this.obtenerTotalesCarrito();
    this.obtenerCarrito();
  }

  obtenerTotalesCarrito() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.sweetAlert.cargando();
    this.ApiService.post('INVObtenerTotalesCarritoCompra/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          this.librosCarrito = "";
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.totales = response;
        this.mostrarPaypal(this.totales[3]);
      },
      (error) => {
        this.sweetAlert.close();
        this.Router.navigate(['login']);
      }
    );
  }

  obtenerCarrito() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.ApiService.post('INVObtenerLibrosCarritoCompra/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          this.Router.navigate(['principal']);
          this.librosCarrito = "";
          return;
        } 
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.librosCarrito = response;
      },
      (error) => {
        this.Router.navigate(['login']);
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

  mostrarPaypal(total: number) {
    const paypalButtonContainer = document.getElementById("paypal-button-container");
    if (paypalButtonContainer) {
        paypalButtonContainer.innerHTML = "";
    } else {
        console.error("El elemento con id 'paypal-button-container' no existe.");
    }

    paypal.Buttons({
        // Configuración del pago
        createOrder: (data: any, actions: any) => {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total // El monto del pago
                    }
                }]
            });
        },
        // Ejecuta cuando el pago se aprueba
        onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
                let payerName = details.payer.name.given_name;
                let payerSurname = details.payer.name.surname;
                let payerEmail = details.payer.email_address;

                // Accede a información específica del pedido
                let idOrden = details.purchase_units[0].payments.captures[0].id;
                let purchaseAmount = details.purchase_units[0].amount.value;
                let currencyCode = details.purchase_units[0].amount.currency_code;

                // Accede a información de la transacción
                let transactionStatus = details.status;

                // Llama a tu función
                this.registrarVenta(idOrden);
            });
        },
        onError: (err: any) => {
            console.error(err);
            this.sweetAlert.mensajeError("Fallo al Realizar Compra");
        }
    }).render('#paypal-button-container'); // Renderiza el botón en el contenedor especificado
    this.sweetAlert.close();
}
  actualizarCarrito(mensaje : any) {
    this.obtenerCarrito();
    this.obtenerTotalesCarrito();
    this.BarraUsuarioComponent.comprobarCantidadCarrito();
  }

  eliminarlibro(mensaje : any) {
    this.obtenerCarrito();
    this.obtenerTotalesCarrito();
    this.BarraUsuarioComponent.comprobarCantidadCarrito();
  }

  registrarVenta(idOrden : any) {
    let datosGenerales = this.prepararDatosGeneralesRegistrarVenta(idOrden);
    if (!datosGenerales) {
      return;
    }

    this.ApiService.post('VENRegistrarVenta/', datosGenerales).subscribe(
      (response) => {
        if (typeof response === 'boolean') {
          this.librosCarrito = "";
          return;
        } 
        this.actualizarCarrito("");
        this.sweetAlert.mensajeFunciono("Venta Generada Correctamente");
        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales.token);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales.token); // Para objetos
        this.librosCarrito = "";
      },
      (error) => {
        this.sweetAlert.mensajeError("Fallo al Realizar la Venta, Guardar ID Orden Paypal");
        this.actualizarCarrito("");
      }
    );
  }

  prepararDatosGeneralesRegistrarVenta(idOrden : any) {
    let token = this.AlmacenamientoLocalService.obtenerAlmacenamientoLocal("clave");
    token = this.AlmacenamientoLocalService.actualizarToken(token);

    let datosGeneralesAntesEncapsular = {
      idOrdenPaypal : idOrden,
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
