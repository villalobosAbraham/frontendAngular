import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { FormsModule } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-libros-carrito',
  imports: [CommonModule, FormsModule],
  templateUrl: './libros-carrito.component.html',
  styleUrl: './libros-carrito.component.css'
})
export class LibrosCarritoComponent {
  @Input() libro : any = "";
  total : any = "";
  cantidad : any = "";
  maximo : any = "";
  ngOnInit() {
    this.cantidad = this.libro[1];
    this.total = (this.libro[3] - this.libro[4] + this.libro[5]) * this.cantidad;
    this.maximo = this.libro[8];
  }

  actualizarValor() {
    if (!this.comprobarNuevaCantidad()) {
      
    }
    this.total = (this.libro[3] - this.libro[4] + this.libro[5]) * this.cantidad;
    let inputTotal = "totalLibro" + "" + this.libro[0];
    $("#totalLibro").val(inputTotal);
  }

  comprobarNuevaCantidad() {
    
    return false;
  }
  
}
