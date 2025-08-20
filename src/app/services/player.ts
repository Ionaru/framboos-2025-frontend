import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { paths, components } from '../api/schema';

export type Player = components['schemas']['Player'];

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  readonly playerId = signal<string | undefined>(undefined);

  readonly #player = httpResource<
    paths['/player/{playerId}']['get']['responses'][200]['content']['application/json']
  >(() => {
    const playerId = this.playerId();
    return playerId ? `player/${playerId}` : undefined;
  });

  readonly player = this.#player.value.asReadonly();
}
