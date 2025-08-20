import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { adminPasswordInterceptor } from './interceptors/admin-password';
import { baseUrlInterceptor } from './interceptors/base-url';
import { playerPasswordInterceptor } from './interceptors/player-password';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        baseUrlInterceptor,
        adminPasswordInterceptor,
        playerPasswordInterceptor,
      ]),
    ),
  ],
};
