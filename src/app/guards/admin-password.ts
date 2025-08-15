import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SiteStatus } from '../errors';

export const adminPasswordGuard: CanActivateFn = () => {
  const router = inject(Router);
  const password = prompt('Hi there! What is the password? 🔑');
  // TODO: Check password with server.
  const passwordResult = password === '1234';
  if (passwordResult) {
    return true;
  }

  alert('Wrong password! This incident will be reported.');
  return router.createUrlTree(['/'], {
    queryParams: { siteStatus: SiteStatus.WRONG_PASSWORD },
  });
};
