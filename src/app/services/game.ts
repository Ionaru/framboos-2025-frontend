import { httpResource } from '@angular/common/http';
import { effect, inject, Injectable, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { paths, components } from '../api/schema';


import { PlayerService } from './player';

export type Game = components['schemas']['GameStateDTO'];
export type Network = components['schemas']['NetworkDTO'];

const GAME_POLL_INTERVAL = 3000;

@Injectable({
  providedIn: 'root',
})
export class GameService {
  readonly #playerService = inject(PlayerService);

  readonly poller = toSignal(interval(GAME_POLL_INTERVAL));

  readonly #game = httpResource<
    paths['/game/{playerId}']['get']['responses'][200]['content']['*/*']
  >(() => {
    const playerId = this.#playerService.playerId();
    return playerId ? `game/${playerId}` : undefined;
  });

  readonly #network = httpResource<
    paths['/game/network/{playerId}']['get']['responses'][200]['content']['*/*']
  >(() => {
    const playerId = this.#playerService.playerId();
    return playerId ? `game/network/${playerId}` : undefined;
  });

  readonly game = this.#game.value.asReadonly();
  readonly network = this.#network.value.asReadonly();

  constructor() {
    effect(() => {
      this.poller();
      const playerId = untracked(this.#playerService.playerId);
      if (playerId) {
        this.#game.reload();
      }
    });
  }
}
