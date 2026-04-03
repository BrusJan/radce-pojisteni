import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStoreService } from '../services/auth-store.service';

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStoreService);
  const router = inject(Router);
  if (store.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};
