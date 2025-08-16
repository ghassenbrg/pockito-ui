import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from '../../core/keycloak.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Welcome to Pockito</h1>
        
        <!-- User Information -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-blue-900 mb-3">User Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-blue-700">Username</label>
              <p class="text-blue-900">{{ getUserDisplayName() }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-blue-700">Email</label>
              <p class="text-blue-900">{{ getUserEmail() }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-blue-700">Roles</label>
              <p class="text-blue-900">{{ getRoles().join(', ') || 'No roles assigned' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-blue-700">Token Expires</label>
              <p class="text-blue-900">{{ getTokenExpirationTime() }}</p>
            </div>
          </div>
        </div>

        <!-- Keycloak Status -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-green-900 mb-3">Authentication Status</h2>
          <div class="space-y-2">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span class="text-green-700">Authenticated: {{ isAuthenticated() ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span class="text-green-700">Token Valid: {{ isTokenValid() ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div class="flex space-x-4">
            <button 
              (click)="refreshToken()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Refresh Token
            </button>
            <button 
              (click)="openAccountManagement()"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Account Settings
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
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Component is ready
  }

  getUserDisplayName(): string {
    return this.keycloakService.getUsername();
  }

  getUserEmail(): string {
    return this.keycloakService.getEmail();
  }

  getRoles(): string[] {
    return this.keycloakService.getRoles();
  }

  isAuthenticated(): boolean {
    return this.keycloakService.isAuthenticated();
  }

  isTokenValid(): boolean {
    return !this.keycloakService.isTokenExpired();
  }

  getTokenExpirationTime(): string {
    const exp = this.keycloakService.getTokenExpiration();
    if (exp === 0) return 'Unknown';
    return new Date(exp * 1000).toLocaleString();
  }

  async refreshToken(): Promise<void> {
    try {
      await this.keycloakService.getToken();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
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
}
