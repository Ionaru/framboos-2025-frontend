import { HttpInterceptorFn } from "@angular/common/http";

export const adminPasswordInterceptor: HttpInterceptorFn = (req, next) => {
  const adminPassword = sessionStorage.getItem('adminPassword');
  if (adminPassword && req.url.includes('/raspberry-byte-brawl/admin/') && !req.headers.has('Authorization')) {
    req = req.clone({setHeaders: {Authorization: `Bearer ${adminPassword}`}});
  }
  return next(req);
};
