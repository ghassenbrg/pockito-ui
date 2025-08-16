import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../core/keycloak.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../services/utilities.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { raise } from '../../state/notification/notification.actions';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Pockito</h1>
          <p class="text-gray-600 text-lg">Smart Budget Management</p>
        </div>
        
        <!-- Loading State -->
        <div *ngIf="isLoading" class="mb-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Initializing...</p>
        </div>
        
        <!-- Main Content -->
        <div *ngIf="!isLoading">
          <div class="mb-8">
            <p class="text-gray-700 mb-4">
              Take control of your finances with our intuitive budget tracking and expense management tools.
            </p>
          </div>
          
          <button 
            (click)="login()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In to Continue
          </button>
          
          <!-- Test API Buttons -->
          <div class="mt-6 space-y-3">
            <button 
              (click)="testPublicEndpoint()"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Test Public API
            </button>
            <button 
              (click)="testProtectedEndpoint()"
              class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Test Protected API
            </button>
          </div>
          
          <div class="mt-6 text-sm text-gray-500">
            <p>Secure authentication powered by Keycloak</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LandingComponent implements OnInit, OnDestroy {
  isLoading = true;
  private subscription = new Subscription();

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private utilitiesService: UtilitiesService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.keycloakService.getInitialized().subscribe(initialized => {
        if (initialized) {
          this.isLoading = false;
          
          // Redirect to app if already authenticated
          if (this.keycloakService.isAuthenticated()) {
            this.router.navigate(['/app']);
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  login(): void {
    this.keycloakService.login();
  }

  testPublicEndpoint(): void {
    this.utilitiesService.getPublicInfo().subscribe({
      next: (response) => {
        console.log('Public API Response:', response);
        this.store.dispatch(raise({ 
          message: `Public API Success: ${response.message}`, 
          status: 200, 
          displayType: 'banner',
          notificationType: 'success'
        }));
      },
      error: (error) => {
        console.error('Public API Error:', error);
        this.store.dispatch(raise({ 
          message: `Public API Error: ${error.message || 'Unknown error'}`, 
          status: error.status || 500, 
          displayType: 'banner',
          notificationType: 'error'
        }));
      }
    });
  }

  testProtectedEndpoint(): void {
    this.utilitiesService.accessProtectedEndpoint().subscribe({
      next: (response) => {
        console.log('Protected API Response:', response);
        this.store.dispatch(raise({ 
          message: `Protected API Success: ${response.message}`, 
          status: 200, 
          displayType: 'banner',
          notificationType: 'success'
        }));
      },
      error: (error) => {
        console.error('Protected API Error:', error);
        this.store.dispatch(raise({ 
          message: `Protected API Error: ${error.message || 'Unknown error'}`, 
          status: error.status || 500, 
          displayType: 'banner',
          notificationType: 'error'
        }));
      }
    });
  }
}
