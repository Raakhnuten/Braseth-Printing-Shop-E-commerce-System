import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { APP_CONFIG } from '../constants/app-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

  if (authToken) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // TODO: attempt token refresh before logging out
          authService.logout();
        }
        return throwError(() => error);
      }),
    );
  }

  return next(req);
};