import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { KeycloakService } from './core/keycloak.service';

// Initialize Keycloak before the application starts
function initializeApp(keycloakService: KeycloakService) {
  return async () => {
    try {
      // Initialize Keycloak with environment configuration
      await keycloakService.init();
      
      return true;
    } catch (error) {
      console.error('Application initialization failed:', error);
      return false;
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    // Provide services explicitly
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [KeycloakService],
      multi: true
    }
  ],
};
