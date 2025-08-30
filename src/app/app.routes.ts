import { Routes } from '@angular/router';
import { authGuard } from '@core/auth.guard';
import { landingGuard } from './core/landing.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [landingGuard],
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./core/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
