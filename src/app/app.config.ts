import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { tokenInterceptor } from './core/token.interceptor';
import { errorInterceptor } from './core/error.interceptor';
import { notificationReducer } from './state/notification/notification.reducer';
import { KeycloakService } from './core/keycloak.service';
import { EnvironmentService } from './core/environment.service';

// Initialize environment configuration and Keycloak before the application starts
function initializeApp(environmentService: EnvironmentService, keycloakService: KeycloakService) {
  return async () => {
    try {
      // First, load environment configuration
      await environmentService.loadConfig();
      
      // Then initialize Keycloak with the loaded config
      const config = environmentService.config;
      await keycloakService.init(config.keycloak);
      
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
    provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor])),
    provideStore({ notification: notificationReducer }),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    // Provide services explicitly
    EnvironmentService,
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [EnvironmentService, KeycloakService],
      multi: true
    }
  ],
};
