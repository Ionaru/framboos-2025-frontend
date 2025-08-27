import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';

import { Button } from '../components/button';
import { AdminService } from '../services/admin';
import { PlayerService } from '../services/player';

import { PlayPage } from './play';

@Component({
  imports: [PlayPage, Button],
  template: `
    @let p = player();
    @if (p) {
      <p class="fixed top-4 left-1/2 -translate-x-1/2 text-2xl">
        Spectating {{ p.name }}
      </p>
      <button app-button class="fixed top-4 left-4 z-10" (click)="toAdmin()">
        Admin Panel
      </button>
      <div class="fixed top-4 right-4 z-10 flex gap-3">
        <button app-button (click)="next()">⏸️</button>
        <button app-button (click)="next()">Next</button>
      </div>
    }
    <app-play
      [playerId]="playerId()"
      [gameStatistics]="gameStatistics()"
      [adminOverride]="true"
    />
  `,
  styles: `
    app-play {
      ::ng-deep #play-logout,
      ::ng-deep #play-home {
        display: none;
      }
    }
  `,
})
export class SpectatePage implements OnDestroy {
  readonly playerId = input.required<string>();

  readonly #router = inject(Router);
  readonly #playerService = inject(PlayerService);
  readonly #adminService = inject(AdminService);

  readonly player = this.#playerService.player;

  readonly gameStatistics = computed(() => {
    const game =
      this.#adminService.games.value()?.practiceGames[this.playerId()];
    if (!game) {
      return undefined;
    }
    return game;
  });

  toAdmin() {
    this.#router.navigate(['/admin']);
  }

  async next() {
    const currentPlayer = this.#playerService.player();
    this.#adminService.reloadPlayers();
    const players = this.#adminService.players.value() ?? [];
    const currentIndex = players.findIndex((p) => p.id === currentPlayer?.id);
    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];
    if (nextPlayer) {
      this.#playerService.playerId.set(nextPlayer.id);
      this.#router.navigate(['/spectate'], {
        queryParams: { playerId: nextPlayer.id },
      });
    }
  }

  constructor() {
    effect(() => {
      const player = this.player();
      if (player) {
        this.#adminService.gamePollerEnabled.set(true);
      } else {
        this.#adminService.gamePollerEnabled.set(false);
      }
    });
  }

  ngOnDestroy() {
    this.#adminService.gamePollerEnabled.set(false);
  }
}
