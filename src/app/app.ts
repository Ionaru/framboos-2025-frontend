import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PageContainer } from './components/page-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageContainer],
  template: `
    <app-page-container>
      <router-outlet />
    </app-page-container>
  `,
})
export class App {}
