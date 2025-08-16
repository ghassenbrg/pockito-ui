import { Routes } from '@angular/router';
import { landingGuard } from './core/landing.guard';
import { authRequiredGuard } from './core/auth-required.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [landingGuard],
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'app',
    canActivate: [authRequiredGuard],
    loadComponent: () => import('./features/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
