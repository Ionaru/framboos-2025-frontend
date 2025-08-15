import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageContainer } from './components/page-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageContainer],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('byte-brawl');
}
