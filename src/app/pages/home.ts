import {
  Component,
  computed,
  effect,
  input,
  model,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxBorderBeamComponent } from '@omnedia/ngx-border-beam';
import { Page } from '../components/page';
import { NgxNeonUnderlineComponent } from '@omnedia/ngx-neon-underline';
import { NgxCrypticTextComponent } from '@omnedia/ngx-cryptic-text';
import { SiteStatus } from '../errors';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [
    RouterLink,
    NgxBorderBeamComponent,
    Page,
    NgxNeonUnderlineComponent,
    NgxCrypticTextComponent,
    FormsModule,
  ],
  template: `
    <app-page class="flex flex-col items-center justify-center">
      @if (siteStatus() === SiteStatus.WRONG_ADMIN_PASSWORD.toString()) {
        <p class="text-white text-center">Wrong password!</p>
        <p class="text-gray-400 text-center">
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">
            Click here to try again
          </a>
        </p>
      } @else if (
        siteStatus() === SiteStatus.WRONG_PLAYER_PASSWORD.toString()
      ) {
        <p class="text-white text-center">Wrong password!</p>
      }
      <om-border-beam
        class=""
        [gradientColorStart]="'#0ea5e9'"
        [gradientColorEnd]="'#6366f1'"
      >
        <div class="rounded p-8">
          <h2 class="text-4xl font-bold text-center metal font-mono">
            🍇 Vrolijke Framboos 2025
          </h2>
          <h1 class="text-8xl font-bold h-50 metal font-mono">
            🕸️ <om-cryptic-text [text]="titlePartOne()" />&nbsp;<om-cryptic-text
              [text]="titlePartTwo()"
            />
            🕷️
            <om-neon-underline />
          </h1>
          <div class="flex flex-col items-center justify-center gap-4 mt-8">
            <input
              type="text"
              placeholder="Enter your player ID"
              class="bg-primary text-white px-4 py-2 rounded cursor-pointer text-center w-full"
              [(ngModel)]="playerId"
            />
            <button
              [disabled]="!playerId()"
              class="bg-primary text-white px-4 py-2 rounded cursor-pointer disabled:opacity-50"
              routerLink="/play"
              [queryParams]="{ playerId: playerId() }"
            >
              Join the {{ titlePartOne() }} {{ titlePartTwo() }}
            </button>
            <p class="text-gray-400 cursor-pointer" routerLink="/admin">
              Admin Panel
            </p>
          </div>
        </div>
      </om-border-beam>
    </app-page>
  `,
  styles: `
    .container-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 2rem;
      height: 350px;
      text-align: center;
      background: rgba(0, 0, 0, 0.1);
    }
  `,
})
export class HomePage {
  readonly siteStatus = input<string>();
  readonly SiteStatus = SiteStatus;

  readonly titleParts = [
    ['Byte', 'Web'],
    ['Brawl', 'Crawl'],
  ] as const;

  readonly titlePartOne = signal<string>(
    this.titleParts[0][Math.floor(Math.random() * this.titleParts[0].length)] ??
      '',
  );
  readonly titlePartTwo = signal<string>(
    this.titleParts[1][Math.floor(Math.random() * this.titleParts[1].length)] ??
      '',
  );

  readonly playerId = model<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const playerId = sessionStorage.getItem('playerId');
      if (playerId) {
        this.playerId.set(playerId);
      }
    });
  }
}
