import { HttpInterceptorFn } from '@angular/common/http';

export const playerPasswordInterceptor: HttpInterceptorFn = (req, next) => {
  const playerPassword = sessionStorage.getItem('playerPassword');
  if (playerPassword && !req.headers.has('Authorization')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${playerPassword}` },
    });
  }
  return next(req);
};
