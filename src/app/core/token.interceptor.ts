import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { KeycloakService } from './keycloak.service';

export function tokenInterceptor(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const kc = inject(KeycloakService);
  
  return from(kc.getToken()).pipe(
    switchMap(token => {
      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next(authReq);
    })
  );
}
