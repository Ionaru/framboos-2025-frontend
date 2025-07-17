import { Routes } from '@angular/router';
import { HomePage } from './pages/home';
import { AdminPage } from './pages/admin';
import { adminPasswordGuard } from './guards/admin-password';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'admin',
    component: AdminPage,
    canActivate: [adminPasswordGuard],
  },
];
