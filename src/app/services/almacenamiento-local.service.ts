import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlmacenamientoLocalService {

  constructor() { }

  // Método para obtener datos del localStorage
  obtenerAlmacenamientoLocal(key: string) {
    let storedData = localStorage.getItem(key);

    // Verificar si los datos existen y si son válidos
    if (storedData) {
      try {
        // Intentar parsear el valor almacenado (JSON)
        let parsedData = JSON.parse(storedData);
        
        // Si es válido, devolver los datos
        return parsedData;
      } catch (error) {
        // Si el JSON es inválido, borrar los datos y devolver false
        localStorage.removeItem(key);  // Borra los datos inválidos
        return false;
      }
    } else {
      // Si no hay datos, devolver false
      return false;
    }
  }

  // Método para guardar datos en localStorage
  guardarAlmacenamientoLocal(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Método para eliminar datos de localStorage
  eliminarAlmacenamientoLocal(key: string) {
    localStorage.removeItem(key);
  }

  // Método para eliminar todo el localStorage
  limpiarAlmacenamientoLocal() {
    localStorage.clear();
    localStorage.removeItem("clave");
  }

  actualizarToken(token : any) {
    if (!token || !this.validarToken(token)) {
      return false;
    }
    token["expiracion"] = this.crearHoraExpiracion();

    return token;
  }

  validarToken(token : any) {
    if (!token) {
      return false;
    }
    let fechaToken = new Date(token["expiracion"]);
    let fechaActual = new Date();

    if (fechaActual > fechaToken) {
      return false;
    }

    return true;
  }

  crearHoraExpiracion() {
    // Obtener la fecha y hora actual
    let horaExpiracion = new Date();

    // Sumar 3 horas
    horaExpiracion.setHours(horaExpiracion.getHours() + 3);

    // Retornar la nueva fecha
    return horaExpiracion;
  }
}
