import { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';

/**
 * CSRF Protection Interceptor
 *
 * This interceptor is a placeholder for CSRF protection that will be needed when
 * migrating from Bearer token auth to cookie-based auth (HttpOnly, Secure, SameSite).
 *
 * ## When to activate:
 *   - After the backend implements cookie-based auth
 *   - The backend sets a readable `XSRF-TOKEN` cookie on the first GET request
 *   - The frontend must send the token value as the `X-XSRF-TOKEN` header
 *
 * ## Current status:
 *   - Bearer token auth (current): CSRF is not needed because tokens are not sent
 *     automatically by the browser.
 *   - Cookie-based auth (future): CSRF is needed because the browser sends cookies
 *     automatically on every request.
 *
 * ## How CSRF works with Angular + Spring Boot:
 *   1. Backend sets a cookie: `XSRF-TOKEN=<random-value>` (readable by JS)
 *   2. Angular's HttpClient automatically reads `XSRF-TOKEN` cookie and sets
 *      `X-XSRF-TOKEN` header on mutating requests (POST, PUT, DELETE, PATCH)
 *   3. Backend validates the header matches the expected token
 *
 * ## Implementation steps when ready:
 *   1. Add this interceptor to the `provideHttpClient(withInterceptors([...]))` array
 *   2. Configure Angular's CSRF handling or manually read the cookie and set header
 *   3. See: https://angular.dev/api/common/http/HttpClientXsrfModule
 *
 * TODO: Activate this interceptor when the backend supports cookie-based auth.
 * For now, the Bearer token flow provides CSRF resistance since the token is not
 * automatically included by the browser on cross-origin requests.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip CSRF for auth endpoints that don't need it
  if (req.url.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      req.url.includes(API_ENDPOINTS.AUTH.REGISTER) ||
      req.url.includes(API_ENDPOINTS.AUTH.REFRESH) ||
      req.url.includes(API_ENDPOINTS.SECURITY.CSRF_TOKEN)) {
    return next(req);
  }

  // TODO: When backend sets XSRF-TOKEN cookie, read it and set X-XSRF-TOKEN header:
  //   const csrfToken = document.cookie
  //     .split('; ')
  //     .find(row => row.startsWith('XSRF-TOKEN='))
  //     ?.split('=')[1];
  //   if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
  //     req = req.clone({ setHeaders: { 'X-XSRF-TOKEN': csrfToken } });
  //   }

  return next(req);
};
