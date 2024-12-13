import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  constructor() {}

  mensajeError(mensaje : string) {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: '<h3>'+mensaje+'</h3>',
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 1800,
    })
  }

  mensajeFunciono(mensaje : string) {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: '<h3>'+mensaje+'</h3>',
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 1800,
    })
  }

  mensajeInformacion(mensaje : string) {
    Swal.fire({
      position: 'top-end',
      icon: 'info',
      title: '<h3>'+mensaje+'</h3>',
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 1800,
    })
  }

  mensajeFuncionoAgregarLibro() {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: '<h3> Agregado Correctamente </h3>',
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 1800,
    })
  }

  cargando() {
    Swal.fire({
        toast: true,
        position: 'top-end',
        title: 'Cargando',
        showConfirmButton: false,
        background: '#fff linear-gradient(145deg, rgba(255,255,255,1) 30%, rgba(0,136,204,1) 100%',
        didOpen: () => {
            Swal.showLoading();
        }
    });
  }

  close() {
    Swal.close();
  }
}
