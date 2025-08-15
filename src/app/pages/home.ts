import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RaspberryEmoji } from '../components/raspberry-emoji';
import { NgxBorderBeamComponent } from '@omnedia/ngx-border-beam';
import { Page } from '../components/page';
import { NgxNeonUnderlineComponent } from '@omnedia/ngx-neon-underline';
import { NgxFlickeringGridComponent } from '@omnedia/ngx-flickering-grid';
import { SiteStatus } from '../errors';

@Component({
  imports: [
    RouterLink,
    NgxBorderBeamComponent,
    Page,
    NgxNeonUnderlineComponent,
  ],
  template: `
    <app-page class="flex flex-col items-center justify-center">
      @if (siteStatus() === SiteStatus.WRONG_PASSWORD.toString()) {
        <p class="text-white">Wrong password!</p>
      }
      <om-border-beam
        class=""
        [gradientColorStart]="'#0ea5e9'"
        [gradientColorEnd]="'#6366f1'"
      >
        <div class="rounded p-8">
          <h1 class="text-4xl font-bold h-50">
          🍇 Byte Brawl 
            <om-neon-underline />
          </h1>
          <div class="flex flex-col items-center justify-center gap-4 mt-8">
            <button
              class="bg-primary text-white px-4 py-2 rounded cursor-pointer"
              routerLink="/play"
            >
              Join the Byte Brawl
            </button>
            <p class="dark:text-white/50 text-black/50 cursor-pointer" routerLink="/admin">
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
}
