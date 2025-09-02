import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { KeycloakService } from './core/security/keycloak.service';
import { tokenInterceptor } from './core/interceptor/token.interceptor';
import { errorInterceptor } from './core/interceptor/error.interceptor';

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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        tokenInterceptor,
        errorInterceptor
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
      fallbackLang: 'en',
      lang: 'en',
      // optional: extend: false, compiler/parser/missingTranslationHandler via provider fns
    }),
  ],
};
