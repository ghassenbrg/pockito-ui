import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from './keycloak.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard for protected routes (/app/*)
 * - If authenticated: allows access
 * - If not authenticated: redirects to Keycloak login
 */
export const authRequiredGuard = () => {
  const kc = inject(KeycloakService);
  const router = inject(Router);
  
  return kc.getInitialized().pipe(
    take(1),
    map(initialized => {
      if (!initialized) {
        return false; // Deny access while initializing
      }
      
      if (kc.isAuthenticated()) {
        return true; // Allow access to protected route
      }
      
      kc.login(); // Redirect to login
      return false;
    })
  );
};
