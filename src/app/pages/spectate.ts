import { Component, inject, input } from '@angular/core';

import { PlayPage } from './play';
import { PlayerService } from '../services/player';
import { AdminService } from '../services/admin';
import { Router } from '@angular/router';
import { Button } from '../components/button';

@Component({
  imports: [PlayPage, Button],
  template: `
    @let p = player();
    @if (p) {
      <p class="fixed top-3 left-1/2 -translate-x-1/2 text-2xl">
        Spectating {{ p.name }}
      </p>
      <button app-button class="fixed top-3 left-3 z-10" (click)="logout()">
        Back to admin
      </button>
      <button app-button class="fixed top-3 right-3 z-10" (click)="next()">
        Next
      </button>
    }
    <app-play [playerId]="playerId()" [adminOverride]="true" />
  `,
  styles: `
    app-play ::ng-deep #play-logout {
      display: none;
    }
  `,
})
export class SpectatePage {
  readonly playerId = input.required<string>();

  readonly #router = inject(Router);
  readonly #playerService = inject(PlayerService);
  readonly #adminService = inject(AdminService);
  readonly player = this.#playerService.player;

  logout() {
    this.#router.navigate(['/admin']);
  }

  async next() {
    const currentPlayer = this.#playerService.player();
    this.#adminService.reloadPlayers();
    // this.#adminService.players.
    const players = this.#adminService.players.value() ?? [];
    const currentIndex = players.findIndex((p) => p.id === currentPlayer?.id);
    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];
    if (nextPlayer) {
      this.#playerService.playerId.set(nextPlayer.id);
    }
  }
}
