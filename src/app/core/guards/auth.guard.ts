import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // NOTE: This is a client-side UX guard only.
  // Real authorization must be enforced by the backend on every API request.
  // The isLoggedIn() check reads from localStorage and can be bypassed by
  // a malicious user editing localStorage directly.
  //
  // TODO: When the backend is ready, optionally call
  //   authService.validateSession().pipe(takeUntilDestroyed(...)).subscribe(...)
  // to verify the token server-side before allowing navigation. For now the guard
  // stays fast (synchronous) to avoid delaying route transitions.
  //
  // The AuthService.validateSession() method exists and is API-ready with mock
  // fallback. When activated, it should:
  //   1. Return false → redirect to login (session expired / invalid)
  //   2. Return true → allow navigation

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
  return true;
};