import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from '../../core/keycloak.service';
import { UtilitiesService } from '../../services/utilities.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { raise } from '../../state/notification/notification.actions';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">Pockito</h1>
            </div>
            
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">
                Welcome, {{ getUserDisplayName() }}
              </span>
              
              <!-- Test API Buttons -->
              <button 
                (click)="testPublicEndpoint()"
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Test Public API
              </button>
              <button 
                (click)="testProtectedEndpoint()"
                class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Test Protected API
              </button>
              
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
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class AppLayoutComponent {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private keycloakService: KeycloakService,
    // eslint-disable-next-line no-unused-vars
    private utilitiesService: UtilitiesService,
    // eslint-disable-next-line no-unused-vars
    private store: Store<AppState>
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
    // Logout from Keycloak and redirect to landing page
    this.keycloakService.logout({
      redirectUri: window.location.origin
    });
  }

  hasRole(role: string): boolean {
    return this.keycloakService.hasRole(role);
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
