import { HttpInterceptorFn } from '@angular/common/http';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('http://localhost:8080/raspberry-byte-brawl/')) {
    req = req.clone({
      url: `http://localhost:8080/raspberry-byte-brawl/${req.url}`,
    });
  }
  return next(req);
};
