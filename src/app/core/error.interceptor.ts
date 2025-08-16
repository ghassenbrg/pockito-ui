import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { KeycloakService } from './keycloak.service';
import { raise } from '../state/notification/notification.actions';

export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const store = inject(Store);
  const keycloakService = inject(KeycloakService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        // Unauthorized or Forbidden - handle authentication issues
        if (keycloakService.isAuthenticated()) {
          // If we have a token but still get 401/403, token might be expired or invalid
          console.warn('Token appears to be invalid, logging out user');
          keycloakService.logout();
        } else {
          // User is not authenticated, redirect to login
          keycloakService.login();
        }
      } else {
        // For other errors, show notification
        store.dispatch(raise({
          message: err.error?.message || err.statusText || 'Unexpected error',
          status: err.status
        }));
      }
      return throwError(() => err);
    })
  );
}
