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
}
