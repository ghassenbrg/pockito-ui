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
import { environment } from '../environments/environment';

// Initialize Keycloak before the application starts
function initializeKeycloak(keycloakService: KeycloakService) {
  return () => {
    return keycloakService.init(environment.keycloak).catch(error => {
      console.error('Keycloak initialization failed:', error);
      return false;
    });
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
    // Provide KeycloakService explicitly
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true
    }
  ],
};
