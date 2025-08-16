import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from './keycloak.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard for the root path (/)
 * - If authenticated: redirects to /app
 * - If not authenticated: allows access to landing page
 */
export const landingGuard = () => {
  const kc = inject(KeycloakService);
  const router = inject(Router);
  
  return kc.getInitialized().pipe(
    take(1),
    map(initialized => {
      if (!initialized) {
        return true; // Allow access while initializing
      }
      
      if (kc.isAuthenticated()) {
        router.navigate(['/app']);
        return false;
      }
      
      return true; // Allow access to landing page
    })
  );
};
