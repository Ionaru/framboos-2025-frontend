import { Routes } from '@angular/router';
import { HomePage } from './pages/home';
import { AdminPage } from './pages/admin';
import { adminPasswordGuard } from './guards/admin-password';
import { PlayPage } from './pages/play';
import { playerPasswordGuard } from './guards/player-password';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'play',
    component: PlayPage,
    canActivate: [playerPasswordGuard],
  },
  {
    path: 'admin',
    component: AdminPage,
    canActivate: [adminPasswordGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
