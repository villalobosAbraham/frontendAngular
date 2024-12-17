import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)},
    { path: 'registrar', loadComponent: () => import('./registrar/registrar.component').then(m => m.RegistrarComponent)},
    { path: 'principal', loadComponent: () => import('./usuarios/principal/principal.component').then(m => m.PrincipalComponent)},
    { path: 'carrito', loadComponent: () => import('./usuarios/carrito/carrito.component').then(m => m.CarritoComponent)},
    { path: 'compras', loadComponent: () => import('./usuarios/compras/compras.component').then(m => m.ComprasComponent)},
    { path: 'sistema', loadComponent: () => import('./sistema/sistema/sistema.component').then(m => m.SistemaComponent)},
    { path: 'libros', loadComponent: () => import('./sistema/libros/libros.component').then(m => m.LibrosComponent)},
    { path: 'autores', loadComponent: () => import('./sistema/autores/autores.component').then(m => m.AutoresComponent)},
    { path: 'inventario', loadComponent: () => import('./sistema/inventario/inventario.component').then(m => m.InventarioComponent)},
    { path: 'ventas', loadComponent: () => import('./sistema/ventas/ventas.component').then(m => m.VentasComponent)},
    { path: '**', redirectTo: 'login', pathMatch: 'full' },
    
];
