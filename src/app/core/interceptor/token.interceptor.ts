import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { KeycloakService } from './security/keycloak.service';

export function tokenInterceptor(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const keycloakService = inject(KeycloakService);
  
  // Only add token if user is authenticated and token is not expired
  if (!keycloakService.isAuthenticated() || keycloakService.isTokenExpired()) {
    return next(req);
  }
  
  return from(keycloakService.getToken()).pipe(
    switchMap(token => {
      const authReq = req.clone({ 
        setHeaders: { 
          Authorization: `Bearer ${token}`,
          'X-Request-ID': crypto.randomUUID() // Add correlation ID for tracking
        } 
      });
      return next(authReq);
    })
  );
}
