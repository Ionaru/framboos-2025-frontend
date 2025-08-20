import { inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { components, paths } from '../api/schema';

export type Player = components['schemas']['Player'];

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  readonly #http = inject(HttpClient);

  readonly #players = httpResource<
    paths['/admin/players']['get']['responses'][200]['content']['application/json']
  >(() => 'admin/players');

  readonly players = this.#players.asReadonly();

  deletePlayer(player: Player) {
    this.#http
      .delete<
        paths['/admin/players/{id}']['delete']['responses'][200]['content']['*/*']
      >(`admin/players/${player.id}`)
      .subscribe(() => {
        this.#players.reload();
      });
  }

  deleteAllPlayers() {
    this.#http
      .delete<
        paths['/admin/players']['delete']['responses'][200]['content']['*/*']
      >('admin/players')
      .subscribe(() => {
        this.#players.reload();
      });
  }
}
