import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { KeycloakService } from './core/security/keycloak.service';
import { tokenInterceptor } from './core/interceptor/token.interceptor';

// ⬇️ v17 API from @ngx-translate/core
import { provideTranslateService } from '@ngx-translate/core';
// ⬇️ v17 API from @ngx-translate/http-loader
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

function initializeApp(keycloakService: KeycloakService) {
  return async () => {
    try {
      await keycloakService.init();
      return true;
    } catch (error) {
      console.error('APP_INITIALIZER: Keycloak init failed', error);
      return false;
    }
  };
}

function initializeTranslations(translateService: TranslateService) {
  return async () => {
    try {
      // Set default language and wait for translations to load
      const saved = localStorage.getItem('preferredLanguage');
      const browser = (navigator.language || 'en').split('-')[0];
      const lang = saved || browser || 'en';
      
      translateService.setFallbackLang('en');
      await firstValueFrom(translateService.use(lang));
      
      return true;
    } catch (error) {
      console.error('APP_INITIALIZER: Translation loading failed', error);
      return false;
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        tokenInterceptor
      ])
    ),
    provideAnimations(),
    MessageService,

    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [KeycloakService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslateService],
      multi: true,
    },

    // ✅ The important part: configure TranslateService + HTTP loader
    provideTranslateService({
      // v17: configure the HTTP loader via its own provider function
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
        // optional:
        // enforceLoading: false,
        // useHttpBackend: false,
      }),
    }),

    // NgRx Store Configuration
    provideStore({}),
    provideEffects([]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};
