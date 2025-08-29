import { HttpInterceptorFn } from '@angular/common/http';

const baseUrl = '/raspberry-byte-brawl';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(baseUrl)) {
    req = req.clone({
      url: `${baseUrl}/${req.url}`,
    });
  }
  return next(req);
};
