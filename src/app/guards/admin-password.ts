import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SiteStatus } from '../errors';

export const adminPasswordGuard: CanActivateFn = async () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  const tryPassword = async (password: string): Promise<boolean> => {
    try {
      await firstValueFrom(
        http.get('admin/players', {
          headers: { Authorization: `Bearer ${password}` },
        }),
      );
      return true;
    } catch {
      return false;
    }
  };

  const passwordFromStorage = sessionStorage.getItem('adminPassword') ?? '';
  const storageResult = await tryPassword(passwordFromStorage);
  if (storageResult) {
    return true;
  }

  const password =
    prompt('Hi there! What is the password? 🔒', passwordFromStorage) ??
    passwordFromStorage;
  const promptResult = await tryPassword(password);
  if (promptResult) {
    sessionStorage.setItem('adminPassword', password);
    return true;
  }

  sessionStorage.removeItem('adminPassword');
  alert('Wrong password! This incident will be reported.');

  return router.createUrlTree(['/'], {
    queryParams: { siteStatus: SiteStatus.WRONG_ADMIN_PASSWORD },
  });
};
