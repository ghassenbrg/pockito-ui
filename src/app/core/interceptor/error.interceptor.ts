import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { KeycloakService } from '@core/security/keycloak.service';
import { ToastService } from '@shared/services/toast.service';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private keycloakService: KeycloakService,
    private toastService: ToastService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // Unauthorized - handle authentication issues
          if (this.keycloakService.isAuthenticated()) {
            // If we have a token but still get 401, token might be expired or invalid
            console.warn('Token appears to be invalid, logging out user');
            this.toastService.showError('authentication');
            this.keycloakService.logout();
          } else {
            // User is not authenticated, redirect to login
            this.keycloakService.login();
          }
        } else if (err.status === 403) {
          // Forbidden - user doesn't have permission
          this.toastService.showError('accessDenied');
          console.error('Access denied:', err);
        } else if (err.status === 404) {
          // Not Found
          this.toastService.showError('notFound');
          console.error('Resource not found:', err);
        } else if (err.status === 500) {
          // Internal Server Error
          this.toastService.showError('serverError');
          console.error('Server error:', err);
        } else if (err.status >= 500) {
          // Other server errors
          this.toastService.showError('serverError', { status: err.status });
          console.error('Server error:', err);
        } else if (err.status >= 400) {
          // Other client errors
          this.toastService.showError('requestError', { status: err.status });
          console.error('Client error:', err);
        } else {
          // Network or other errors
          this.toastService.showError('networkError');
          console.error('Network error:', err);
        }
        
        return throwError(() => err);
      })
    );
  }
}
