import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)},
    { path: 'registrar', loadComponent: () => import('./registrar/registrar.component').then(m => m.RegistrarComponent)},
    { path: 'principal', loadComponent: () => import('./usuarios/principal/principal.component').then(m => m.PrincipalComponent)},
    { path: 'carrito', loadComponent: () => import('./usuarios/carrito/carrito.component').then(m => m.CarritoComponent)},
    { path: 'compras', loadComponent: () => import('./usuarios/compras/compras.component').then(m => m.ComprasComponent)},
    { path: 'sistema', loadComponent: () => import('./sistema/sistema/sistema.component').then(m => m.SistemaComponent)},
    { path: '**', redirectTo: 'login', pathMatch: 'full' },
    
];
