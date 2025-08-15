import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakService } from './keycloak.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private kc: KeycloakService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.kc.getToken()).pipe(
      switchMap(token => {
        const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next.handle(authReq);
      })
    );
  }
}
