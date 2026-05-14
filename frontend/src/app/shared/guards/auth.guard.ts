import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStoreService } from '../services/auth-store.service';

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStoreService);
  const router = inject(Router);
  if (store.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

export const advisorGuard: CanActivateFn = () => {
  const store = inject(AuthStoreService);
  const router = inject(Router);
  if (store.isLoggedIn() && store.isAdvisor()) return true;
  if (store.isLoggedIn() && store.isClient()) return router.createUrlTree(['/client']);
  return router.createUrlTree(['/login']);
};

export const clientGuard: CanActivateFn = () => {
  const store = inject(AuthStoreService);
  const router = inject(Router);
  if (store.isLoggedIn() && store.isClient()) return true;
  if (store.isLoggedIn() && store.isAdvisor()) return router.createUrlTree(['/dashboard']);
  return router.createUrlTree(['/login']);
};
