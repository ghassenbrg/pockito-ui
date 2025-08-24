import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { tokenInterceptor } from './core/token.interceptor';
import { errorInterceptor } from './core/error.interceptor';
import { notificationReducer } from './state/notification/notification.reducer';
import { walletReducer } from './state/wallets/wallet.state';
import { WalletEffects } from './state/wallets/wallet.effects';
import { categoryReducer } from './state/categories/category.state';
import { CategoryEffects } from './state/categories/category.effects';
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
    provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor])),
    provideStore({ 
      notification: notificationReducer,
      wallets: walletReducer,
      categories: categoryReducer
    }),
    provideEffects([WalletEffects, CategoryEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
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
