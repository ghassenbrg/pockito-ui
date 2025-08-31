import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from './core/security/keycloak.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  providers: [MessageService] ,
  template: `
    <div *ngIf="isLoading$ | async" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Initializing Keycloak...</p>
      </div>
    </div>
    
    <p-toast position="top-center" key="tc" />

    <router-outlet *ngIf="!(isLoading$ | async)"></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  isLoading$: Observable<boolean>;

  constructor(
    // eslint-disable-next-line no-unused-vars
    private keycloakService: KeycloakService
  ) {
    // Show loading until Keycloak is fully initialized
    this.isLoading$ = this.keycloakService.getInitialized().pipe(
      map(initialized => !initialized)
    );
  }

  ngOnInit(): void {
    // Keycloak initialization is handled in app.config.ts via APP_INITIALIZER
    // This ensures the app doesn't start until Keycloak is ready
  }
}
