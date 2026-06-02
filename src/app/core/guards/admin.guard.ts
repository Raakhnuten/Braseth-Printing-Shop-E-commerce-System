import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // NOTE: This is a client-side UX guard only.
  // Real authorization must be enforced by the backend on every admin API request.
  // The isAdmin() check reads the role from localStorage('seth_store_user') and
  // can be trivially bypassed by editing localStorage. Do NOT rely on this for
  // security — server-side role checks are mandatory.
  //
  // TODO: When the backend is ready, optionally call
  //   authService.validateAdminSession().pipe(takeUntilDestroyed(...)).subscribe(...)
  // to verify the token and role server-side before allowing navigation. For now
  // the guard stays fast (synchronous) to avoid delaying route transitions.
  //
  // The AuthService.validateAdminSession() method exists and is API-ready with mock
  // fallback. When activated, it should:
  //   1. Return false → redirect to login or unauthorized page
  //   2. Return true → allow navigation

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  if (!authService.isAdmin()) {
    router.navigate(['/'], {
      queryParams: { error: 'unauthorized' },
    });
    return false;
  }

  return true;
};