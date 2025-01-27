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

@Component({
  selector: 'app-empleados',
  standalone : true,
  imports: [BarraSistemaComponent, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.css'
})
export class EmpleadosComponent {
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

    this.tabla = $('#tablaEmpleados').DataTable({
      "pageLength": 10,
      "lengthChange": true,
      "destroy": true,
      "autoWidth": false,
      "scrollY": "",
      "columnDefs": [
        { "width": "1%", "targets": 0 }, 
        { "width": "20%", "targets": 1 },
        { "width": "30%", "targets": 2 },
        { "width": "13%", "targets": 3 }, 
        { "width": "13%", "targets": 4 }, 
        { "width": "13%", "targets": 5 }, 
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
    this.obtenerEmpleados();
  }

  obtenerEmpleados() {
    let datosGenerales = this.prepararDatosGeneralesSoloToken();
    if (!datosGenerales) {
      return;
    }

    this.SweetAlertService.cargando();
    this.ApiService.post('ADMObtenerEmpleados/', datosGenerales).subscribe(
      (response : any) => {
        if (typeof response === 'boolean') {
          this.SweetAlertService.close();
          return;
        }

        this.AlmacenamientoLocalService.actualizarToken(datosGenerales.datosGenerales);
        this.AlmacenamientoLocalService.guardarAlmacenamientoLocal('clave', datosGenerales.datosGenerales); // Para objetos
        this.mostrarEmpleados(response);
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

  mostrarEmpleados(empleados : any) {
    this.tabla.clear();
    empleados.forEach((empleado: any) => {
      let action = this.prepararRadioButon(empleado[0]);
      let activo = this.prepararActivo(empleado[2]);
      let fechaNacimiento = this.prepararFecha(empleado[5]);
      let fechaRegistro = this.prepararFecha(empleado[3]);
      this.tabla.row.add([
        action, 
        empleado[1],
        empleado[2],
        empleado[4],
        fechaNacimiento,
        fechaRegistro,
        activo, 
      ]).node();
    });
    this.tabla.draw();
  }

  prepararRadioButon(idEmpleado : any) {
    let radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = "opcionEmpleado";
    radioInput.setAttribute('idEmpleado', idEmpleado);
    return radioInput
  }

  prepararActivo(activo : any) {
    return (activo == "S") ? "Si" : "No";
  }

  prepararFecha(fecha : any) {
    return fecha.split("-").reverse().join("/");
  }
}
