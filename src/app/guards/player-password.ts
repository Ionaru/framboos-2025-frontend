import { inject } from '@angular/core';
import { ActivatedRoute, CanActivateFn, Router } from '@angular/router';
import { SiteStatus } from '../errors';
import { HttpClient } from '@angular/common/http';
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
    prompt('Hi there! What is the password? 🔒', passwordFromStorage) ??
    passwordFromStorage;
  try {
    await firstValueFrom(
      http.get(`game/${playerId}`, {
        headers: { Authorization: `Bearer ${password}` },
      }),
    );
    sessionStorage.setItem('playerPassword', password);
    return true;
  } catch (e) {
    sessionStorage.removeItem('playerPassword');
    alert('Wrong password!');
    return router.createUrlTree(['/'], {
      queryParams: { siteStatus: SiteStatus.WRONG_PLAYER_PASSWORD },
    });
  }
};
