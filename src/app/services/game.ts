import { httpResource } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { paths, components } from '../api/schema';

export type Game = components['schemas']['GameStateDTO'];
export type Network = components['schemas']['NetworkDTO'];

@Injectable({
  providedIn: 'root',
})
export class GameService {
  readonly playerId = signal<string>('');

  readonly #game = httpResource<
    paths['/game/{playerId}']['get']['responses'][200]['content']['*/*']
  >(() => `game/${this.playerId()}`, {
    defaultValue: undefined,
  });
  readonly #network = httpResource<
    paths['/game/network/{playerId}']['get']['responses'][200]['content']['*/*']
  >(() => `game/network/${this.playerId()}`, {
    defaultValue: undefined,
  });

  readonly game = computed(() => {
    const playerId = this.playerId();
    if (!playerId) {
      return undefined;
    }
    return this.#game.value();
  });

  readonly network = computed(() => {
    const playerId = this.playerId();
    if (!playerId) {
      return undefined;
    }
    return this.#network.value();
  });
}
