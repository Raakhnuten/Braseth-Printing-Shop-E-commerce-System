import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { getAuthToken } from '../../shared/utils/storage.util';

/**
 * List of auth endpoints that should NOT have the Bearer token attached and
 * should NOT trigger the refresh-on-401 flow. Login and register don't need
 * tokens; the refresh endpoint must be excluded to avoid infinite loops
 * (if the refresh token itself is expired, the 401 from the refresh endpoint
 * should log out immediately rather than attempting another refresh).
 */
const AUTH_EXCLUDED_PATHS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.REFRESH,
];

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip token injection for auth endpoints that don't need it
  const isExcluded = AUTH_EXCLUDED_PATHS.some((path) => req.url.includes(path));

  // TODO: Migrate to HttpOnly cookies for production security.
  // localStorage is XSS-vulnerable and should only be used until the backend
  // supports secure cookie-based auth. Once migrated, replace this storage read
  // with a cookie read — or remove entirely since HttpOnly cookies are attached
  // automatically by the browser.
  const authToken = getAuthToken();

  if (authToken && !isExcluded) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // If the failing request was itself a refresh attempt, do NOT retry —
        // the refresh token is invalid/expired. Log out immediately.
        if (error.status === 401 && req.url.includes(API_ENDPOINTS.AUTH.REFRESH)) {
          isRefreshing = false;
          authService.logout();
          return throwError(() => error);
        }

        if (error.status === 401 && !isRefreshing) {
          isRefreshing = true;
          // TODO: In production, the backend MUST validate the refresh token
          // and return a new access token. Mock/fake modes return same tokens.
          return authService.refreshToken().pipe(
            switchMap((res) => {
              isRefreshing = false;
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.token}`,
                },
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => refreshError);
            }),
          );
        }

        // If isRefreshing is true and a second 401 arrives, do not retry —
        // the first refresh attempt is still in flight. Log out to be safe.
        if (error.status === 401) {
          isRefreshing = false;
          authService.logout();
        }
        return throwError(() => error);
      }),
    );
  }

  return next(req);
};