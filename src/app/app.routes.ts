import { Routes } from '@angular/router';
import { authGuard } from '@core/security/auth.guard';
import { landingGuard } from './core/security/landing.guard';

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
      {
        path: 'wallets',
        loadComponent: () => import('./features/wallet/wallets/wallets.component').then(m => m.WalletsComponent)
      },
      {
        path: 'wallets/:id',
        loadComponent: () => import('./features/wallet/wallet-detail/wallet-detail.component').then(m => m.WalletDetailComponent)
      },
      /*
      {
        path: 'transactions',
        loadComponent: () => import('./features/transaction/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      },
      {
        path: 'transactions/create',
        loadComponent: () => import('./features/transactions/create-transaction/create-transaction.component').then(m => m.CreateTransactionComponent)
      },
      {
        path: 'transactions/edit/:id',
        loadComponent: () => import('./features/transactions/create-transaction/create-transaction.component').then(m => m.CreateTransactionComponent)
      },
      {
        path: 'transactions/view/:id',
        loadComponent: () => import('./features/transactions/create-transaction/create-transaction.component').then(m => m.CreateTransactionComponent)
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
        path: 'categories',
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'categories/edit/:id',
        loadComponent: () => import('./features/categories/edit-category/edit-category.component').then(m => m.EditCategoryComponent)
      },
      {
        path: 'categories/new',
        loadComponent: () => import('./features/categories/edit-category/edit-category.component').then(m => m.EditCategoryComponent)
      },
      {
        path: 'categories/view/:id',
        loadComponent: () => import('./features/categories/edit-category/edit-category.component').then(m => m.EditCategoryComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'account',
        loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent)
      }
        */
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
