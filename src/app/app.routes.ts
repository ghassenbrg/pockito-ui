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
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'wallets',
        loadComponent: () => import('./features/wallets/wallet-list/wallet-list.component').then(m => m.WalletListComponent)
      },
      {
        path: 'wallets/:id',
        loadComponent: () => import('./features/wallets/wallet-detail/wallet-detail.component').then(m => m.WalletDetailComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./features/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent)
      },
      {
        path: 'budgets',
        loadComponent: () => import('./features/budgets/budgets.component').then(m => m.BudgetsComponent)
      },
      {
        path: 'agreements',
        loadComponent: () => import('./features/agreements/agreements.component').then(m => m.AgreementsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
