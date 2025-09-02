import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { KeycloakService } from '../security/keycloak.service';
import { ToastService } from '../../shared/services/toast.service';

export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const keycloakService = inject(KeycloakService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Unauthorized - handle authentication issues
        if (keycloakService.isAuthenticated()) {
          // If we have a token but still get 401, token might be expired or invalid
          console.warn('Token appears to be invalid, logging out user');
          toastService.showError('authentication');
          keycloakService.logout();
        } else {
          // User is not authenticated, redirect to login
          keycloakService.login();
        }
      } else if (err.status === 403) {
        // Forbidden - user doesn't have permission
        toastService.showError('accessDenied');
        console.error('Access denied:', err);
      } else if (err.status === 404) {
        // Not Found
        toastService.showError('notFound');
        console.error('Resource not found:', err);
      } else if (err.status === 500) {
        // Internal Server Error
        toastService.showError('serverError');
        console.error('Server error:', err);
      } else if (err.status >= 500) {
        // Other server errors
        toastService.showError('serverError', { status: err.status });
        console.error('Server error:', err);
      } else if (err.status >= 400) {
        // Other client errors
        toastService.showError('requestError', { status: err.status });
        console.error('Client error:', err);
      } else {
        // Network or other errors
        toastService.showError('networkError');
        console.error('Network error:', err);
      }
      
      return throwError(() => err);
    })
  );
}
