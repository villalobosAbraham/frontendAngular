import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl: string = environment.backendUrl; // URL base del backend

  constructor(private http: HttpClient) {}

  // Método para realizar un POST
  post<T>(endpoint: string, data?: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.post<T>(url, data || {}, { withCredentials: true }); // Asegura envío de cookies
  }
}
