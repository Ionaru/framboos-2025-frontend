import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const adminPasswordGuard: CanActivateFn = () => {
  const router = inject(Router);
  const password = prompt('Enter password');
  // TODO: Check password with server.
  const passwordResult = password === '1234';
  if (passwordResult) {
    return true;
  }

  alert('Wrong password');
  return router.createUrlTree(['/']);
};
