import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { Button } from '../components/button';
import { AdminService } from '../services/admin';
import { PlayerService } from '../services/player';

import { PlayPage } from './play';

const AUTO_NEXT_INTERVAL = 15000;
const AUTO_NEXT_INTERVAL_SECONDS = Math.round(AUTO_NEXT_INTERVAL / 1000);

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
        @if (autoNextEnabled()) {
          <button app-button (click)="autoNextEnabled.set(false)">
            Playing {{ timeLeft() - 1 }}s
          </button>
        } @else {
          <button app-button (click)="autoNextEnabled.set(true)">Paused</button>
        }
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
export class SpectatePage implements OnInit, OnDestroy {
  readonly playerId = input.required<string>();

  readonly #router = inject(Router);
  readonly #playerService = inject(PlayerService);
  readonly #adminService = inject(AdminService);

  readonly #clock = interval(1000);
  readonly #clockSignal = toSignal(this.#clock);
  readonly timeLeft = computed(
    () =>
      AUTO_NEXT_INTERVAL_SECONDS -
      ((this.#clockSignal() ?? 0) % AUTO_NEXT_INTERVAL_SECONDS),
  );
  readonly autoNextEnabled = signal(true);
  #autoNextSubscription?: Subscription;

  readonly player = this.#playerService.player;

  readonly gameStatistics = computed(
    () => this.#adminService.games.value()?.practiceGames[this.playerId()],
  );

  toAdmin() {
    this.#router.navigate(['/admin']);
  }

  next() {
    const currentGame = this.player()?.id;
    const currentGames = this.#adminService.games.value()?.practiceGames ?? {};
    const currentIndex = Object.keys(currentGames).findIndex(
      (id) => id === currentGame,
    );
    const nextIndex = (currentIndex + 1) % Object.keys(currentGames).length;
    const nextGame = Object.values(currentGames)[nextIndex];
    const nextPlayer = Object.keys(nextGame?.players ?? {})[0];
    if (nextPlayer) {
      this.#router.navigate(['/spectate'], {
        queryParams: { playerId: nextPlayer },
      });
    }
  }

  constructor() {
    effect(() => {
      const player = this.player();
      this.#adminService.slowGamePollerEnabled.set(Boolean(player));
    });
  }

  ngOnInit() {
    this.#autoNextSubscription = this.#clock.subscribe((value) => {
      if (
        value &&
        value % AUTO_NEXT_INTERVAL_SECONDS === 0 &&
        this.autoNextEnabled()
      ) {
        this.next();
      }
    });
  }

  ngOnDestroy() {
    this.#adminService.slowGamePollerEnabled.set(false);
    this.#autoNextSubscription?.unsubscribe();
  }
}
