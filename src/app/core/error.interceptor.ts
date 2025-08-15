import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { raise } from '../state/notification/notification.actions';

export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const store = inject(Store);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      store.dispatch(raise({
        message: err.error?.message || err.statusText || 'Unexpected error',
        status: err.status
      }));
      return throwError(() => err);
    })
  );
}
