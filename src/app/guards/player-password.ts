import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export const playerPasswordGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const playerId =
    router.getCurrentNavigation()?.initialUrl.queryParams['playerId'];
  if (!playerId) {
    return router.createUrlTree(['/']);
  }

  const passwordFromStorage = sessionStorage.getItem('playerPassword') ?? '';
  const password =
    prompt('What is your password? 🔒', passwordFromStorage) ??
    passwordFromStorage;
  try {
    await firstValueFrom(
      http.get(`player/${playerId}`, {
        headers: { Authorization: `Bearer ${password}` },
      }),
    );
    sessionStorage.setItem('playerId', playerId);
    sessionStorage.setItem('playerPassword', password);
    return true;
  } catch {
    sessionStorage.removeItem('playerPassword');
    alert('Unknown player ID or wrong password!');
    return router.createUrlTree(['/']);
  }
};
