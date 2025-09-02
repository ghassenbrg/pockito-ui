import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from '@core/security/keycloak.service';
import { ToastService } from '@shared/services/toast.service';
import { catchError, throwError } from 'rxjs';

export function errorInterceptor(
  req: any,
  next: any
): any {
  const keycloakService = inject(KeycloakService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        if (keycloakService.isAuthenticated()) {
          console.warn('Token appears to be invalid, logging out user');
          toastService.showError('authentication');
          keycloakService.logout();
        }
        return throwError(() => err);
      }

      if (err.status === 403) {
        toastService.showError('forbidden');
        return throwError(() => err);
      }

      if (err.status === 404) {
        toastService.showError('notFound');
        return throwError(() => err);
      }

      if (err.status === 400) {
        handleBadRequestError(err, req, toastService);
        return throwError(() => err);
      }

      if (err.status >= 500) {
        toastService.showError('serverError');
        console.error('Server error:', err);
        return throwError(() => err);
      }

      if (err.status >= 400) {
        toastService.showError('requestFailed', { status: err.status });
        console.error('Client error:', err);
        return throwError(() => err);
      }

      // Handle network errors
      if (!err.status) {
        toastService.showError('networkError');
        console.error('Network error:', err);
        return throwError(() => err);
      }

      return throwError(() => err);
    })
  );
}

function handleBadRequestError(err: HttpErrorResponse, req: any, toastService: ToastService): void {
  if (req.url.includes('/wallets')) {

    toastService.showError('requestFailed', { 
      status: err.status,
      errorMessage: err.error?.message || 'Invalid wallet data provided'
    });
  } else {
    toastService.showError('requestFailed', { status: err.status });
  }
}
