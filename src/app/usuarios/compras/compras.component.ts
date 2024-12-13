import { Component } from '@angular/core';
import { BarraUsuarioComponent } from '../barra-usuario/barra-usuario.component';

@Component({
  selector: 'app-compras',
  standalone : true,
  imports: [BarraUsuarioComponent],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.css'
})
export class ComprasComponent {

}
