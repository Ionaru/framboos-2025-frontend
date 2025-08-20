import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SiteStatus } from '../errors';

export const adminPasswordGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const passwordFromStorage = sessionStorage.getItem('adminPassword') ?? '';
  const password =
    prompt('Hi there! What is the password? 🔒', passwordFromStorage) ??
    passwordFromStorage;
  try {
    await firstValueFrom(
      http.get('admin/players', {
        headers: { Authorization: `Bearer ${password}` },
      }),
    );
    sessionStorage.setItem('adminPassword', password);
    return true;
  } catch (e) {
    sessionStorage.removeItem('adminPassword');
    alert('Wrong password! This incident will be reported.');
    return router.createUrlTree(['/'], {
      queryParams: { siteStatus: SiteStatus.WRONG_ADMIN_PASSWORD },
    });
  }
};
