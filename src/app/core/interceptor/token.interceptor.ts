import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { KeycloakService } from '@core/security/keycloak.service';

export function tokenInterceptor(
  req: any,
  next: any
): any {
  const keycloakService = inject(KeycloakService);
  
  if (!keycloakService.isAuthenticated() || keycloakService.isTokenExpired()) {
    return next(req);
  }
  
  return from(keycloakService.getToken()).pipe(
    switchMap(token => {
      const authReq = req.clone({ 
        setHeaders: { 
          Authorization: `Bearer ${token}`,
          'X-Request-ID': crypto.randomUUID()
        } 
      });
      return next(authReq);
    })
  );
}
