import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { paths, components } from '../api/schema';

export type Player = components['schemas']['Player'];

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  readonly #http = inject(HttpClient);

  getPlayer(playerId: string) {
    return this.#http.get<
      paths['/player/{playerId}']['get']['responses'][200]['content']['application/json']
    >(`player/${playerId}`);
  }
}
