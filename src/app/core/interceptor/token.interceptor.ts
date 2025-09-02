import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { KeycloakService } from '@core/security/keycloak.service';
import { Observable, from, switchMap } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only add token if user is authenticated and token is not expired
    if (!this.keycloakService.isAuthenticated() || this.keycloakService.isTokenExpired()) {
      return next.handle(req);
    }
    
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const authReq = req.clone({ 
          setHeaders: { 
            Authorization: `Bearer ${token}`,
            'X-Request-ID': crypto.randomUUID() // Add correlation ID for tracking
          } 
        });
        return next.handle(authReq);
      })
    );
  }
}
