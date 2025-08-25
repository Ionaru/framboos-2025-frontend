import { Routes } from '@angular/router';

import { adminPasswordGuard } from './guards/admin-password';
import { playerPasswordGuard } from './guards/player-password';
import { AdminPage } from './pages/admin';
import { FinalePage } from './pages/finale';
import { HomePage } from './pages/home';
import { PlayPage } from './pages/play';
import { SettingsPage } from './pages/settings';
import { SpectatePage } from './pages/spectate';

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
    path: 'settings',
    component: SettingsPage,
    canActivate: [adminPasswordGuard],
  },
  {
    path: 'spectate',
    component: SpectatePage,
    canActivate: [adminPasswordGuard],
  },
  {
    path: 'finale',
    component: FinalePage,
    canActivate: [adminPasswordGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
