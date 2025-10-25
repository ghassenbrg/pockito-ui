import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { KeycloakService } from './core/security/keycloak.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  providers: [MessageService],
  template: `
    <div
      *ngIf="isLoading$ | async"
      class="min-h-screen flex items-center justify-center bg-gray-50"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Initializing Keycloak...</p>
      </div>
    </div>

    <router-outlet *ngIf="!(isLoading$ | async)"></router-outlet>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  isLoading$: Observable<boolean>;

  constructor(
    // eslint-disable-next-line no-unused-vars
    private keycloakService: KeycloakService
  ) {
    // Show loading until Keycloak is fully initialized
    this.isLoading$ = this.keycloakService
      .getInitialized()
      .pipe(map((initialized) => !initialized));
  }

  ngOnInit(): void {
    // Keycloak initialization is handled in app.config.ts via APP_INITIALIZER
    // This ensures the app doesn't start until Keycloak is ready

    // Disable pull-to-refresh behavior on mobile devices
    this.disablePullToRefresh();
  }

  /**
   * Disable pull-to-refresh behavior on mobile devices
   * This prevents the browser from refreshing when user scrolls down at the top
   */
  private disablePullToRefresh(): void {
    // Prevent pull-to-refresh on touch devices
    let startY = 0;
    let isAtTop = false;

    // Touch start handler
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isAtTop = window.scrollY === 0;
    };

    // Touch move handler - prevent pull-to-refresh
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // If we're at the top and trying to scroll down (pull-to-refresh gesture)
      if (isAtTop && deltaY > 0) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Also prevent the default behavior on the document
    document.addEventListener(
      'touchstart',
      (e) => {
        if (window.scrollY === 0) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }
}
