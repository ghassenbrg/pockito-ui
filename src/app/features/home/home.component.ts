import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from '../../core/keycloak.service';
import { PwaInstallService } from '../../core/pwa-install.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Welcome to Pockito</h1>
        
        <!-- PWA Install Prompt -->
        <div *ngIf="pwaInstallService.getInstallPromptAvailable()" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-blue-900 mb-3">📱 Install Pockito App</h2>
          <p class="text-blue-700 mb-3">Add Pockito to your home screen for quick access and offline functionality!</p>
          <button 
            (click)="installPwa()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Install App
          </button>
        </div>

        <!-- PWA Debug Section -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-yellow-900 mb-3">🔧 PWA Debug</h2>
          <p class="text-yellow-700 mb-3">Check PWA status and troubleshoot installation issues</p>
          <div class="flex space-x-4">
            <button 
              (click)="debugPwa()"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Debug PWA Status
            </button>
            <button 
              (click)="checkManifest()"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Check Manifest
            </button>
            <button 
              (click)="testPwaFiles()"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Test PWA Files
            </button>
          </div>
        </div>
        
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
    private router: Router,
    public pwaInstallService: PwaInstallService
  ) {}

  ngOnInit(): void {
    // Component is ready
  }

  async installPwa(): Promise<void> {
    try {
      const installed = await this.pwaInstallService.promptForInstall();
      if (installed) {
        console.log('PWA installation initiated');
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
    }
  }

  debugPwa(): void {
    this.pwaInstallService.debugPwaStatus();
  }

  checkManifest(): void {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const href = manifestLink.getAttribute('href');
      console.log('Manifest link found:', href);
      
      // Try to fetch the manifest
      fetch(href!)
        .then(response => {
          console.log('Manifest response status:', response.status);
          console.log('Manifest response headers:', response.headers);
          return response.json();
        })
        .then(manifest => {
          console.log('Manifest content:', manifest);
        })
        .catch(error => {
          console.error('Failed to fetch manifest:', error);
        });
    } else {
      console.log('No manifest link found');
    }
  }

  // Test PWA functionality
  testPwaFiles(): void {
    console.log('=== Testing PWA Files ===');
    
    // Test manifest
    fetch('/assets/manifest.webmanifest')
      .then(response => {
        console.log('Manifest status:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Manifest content:', text);
      })
      .catch(error => {
        console.error('Manifest fetch error:', error);
      });

    // Test service worker
    fetch('/assets/ngsw-worker.js')
      .then(response => {
        console.log('Service Worker status:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Service Worker content length:', text.length);
      })
      .catch(error => {
        console.error('Service Worker fetch error:', error);
      });

    // Test favicon
    fetch('/assets/favicon.png')
      .then(response => {
        console.log('Favicon status:', response.status);
        console.log('Favicon size:', response.headers.get('content-length'));
      })
      .catch(error => {
        console.error('Favicon fetch error:', error);
      });
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
