import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { KeycloakService } from '../../core/keycloak.service';
import { UtilitiesService } from '../../services/utilities.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { raise } from '../../state/notification/notification.actions';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalHostComponent } from '../../shared/modal/modal-host.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ModalHostComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Topbar -->
      <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo and App Name -->
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">Pockito</h1>
            </div>
            
            <!-- Desktop Navigation -->
            <nav class="hidden md:flex space-x-8">
              <a 
                routerLink="/app/dashboard" 
                routerLinkActive="text-blue-600 border-blue-600" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors duration-200"
              >
                Dashboard
              </a>
              <a 
                routerLink="/app/wallets" 
                routerLinkActive="text-blue-600 border-blue-600" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors duration-200"
              >
                Wallets
              </a>
              <a 
                routerLink="/app/transactions" 
                routerLinkActive="text-blue-600 border-blue-600" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors duration-200"
              >
                Transactions
              </a>
              <a 
                routerLink="/app/subscriptions" 
                routerLinkActive="text-blue-600 border-blue-600" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors duration-200"
              >
                Subscriptions
              </a>
              <a 
                routerLink="/app/budgets" 
                routerLinkActive="text-blue-600 border-blue-600" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors duration-200"
              >
                Budgets
              </a>
              <a 
                routerLink="/app/agreements" 
                routerLinkActive="text-blue-600 border-blue-600" 
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors duration-200"
              >
                Agreements
              </a>
            </nav>
            
            <!-- User Menu and Actions -->
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700 hidden sm:block">
                Welcome, {{ getUserDisplayName() }}
              </span>
              
              <!-- Settings Link -->
              <a 
                routerLink="/app/settings"
                class="text-gray-600 hover:text-gray-900 p-2 rounded-md transition-colors duration-200"
                title="Settings"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </a>
              
              <button 
                (click)="openAccountManagement()"
                class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Account
              </button>
              <button 
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 pb-20 md:pb-6">
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>

      <!-- Bottom Navigation (Mobile) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div class="flex justify-around">
          <a 
            routerLink="/app/dashboard" 
            routerLinkActive="text-blue-600" 
            class="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span class="text-xs">Dashboard</span>
          </a>
          
          <a 
            routerLink="/app/wallets" 
            routerLinkActive="text-blue-600" 
            class="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <span class="text-xs">Wallets</span>
          </a>
          
          <a 
            routerLink="/app/transactions" 
            routerLinkActive="text-blue-600" 
            class="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span class="text-xs">Transactions</span>
          </a>
          
          <a 
            routerLink="/app/subscriptions" 
            routerLinkActive="text-blue-600" 
            class="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-xs">Subscriptions</span>
          </a>
          
          <a 
            routerLink="/app/budgets" 
            routerLinkActive="text-blue-600" 
            class="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span class="text-xs">Budgets</span>
          </a>
        </div>
      </nav>

      <!-- Floating Action Button (FAB) -->
      <button 
        (click)="openTransactionModal()"
        class="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 z-50"
        title="Add Transaction"
      >
        <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>

      <!-- Modal Host -->
      <app-modal-host></app-modal-host>
    </div>
  `,
  styles: []
})
export class AppLayoutComponent {
  constructor(
    private keycloakService: KeycloakService,
    private utilitiesService: UtilitiesService,
    private store: Store<AppState>,
    private modalService: ModalService
  ) {}

  getUserDisplayName(): string {
    return this.keycloakService.getUsername();
  }

  getUserEmail(): string {
    return this.keycloakService.getEmail();
  }

  openAccountManagement(): void {
    this.keycloakService.accountManagement();
  }

  logout(): void {
    this.keycloakService.logout({
      redirectUri: window.location.origin
    });
  }

  hasRole(role: string): boolean {
    return this.keycloakService.hasRole(role);
  }

  openTransactionModal(): void {
    this.modalService.open('transaction-modal');
  }

  testPublicEndpoint(): void {
    this.utilitiesService.getPublicInfo().subscribe({
      next: (response) => {
        this.store.dispatch(raise({ 
          message: `Public API Success: ${response.message}`, 
          status: 200, 
          displayType: 'banner',
          notificationType: 'success'
        }));
      }
    });
  }

  testProtectedEndpoint(): void {
    this.utilitiesService.accessProtectedEndpoint().subscribe({
      next: (response) => {
        this.store.dispatch(raise({ 
          message: `Protected API Success: ${response.message}`, 
          status: 200, 
          displayType: 'banner',
          notificationType: 'success'
        }));
      }
    });
  }
}
