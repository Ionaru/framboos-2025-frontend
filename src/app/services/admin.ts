import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { components, paths } from '../api/schema';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, interval } from 'rxjs';

export type Player = components['schemas']['PlayerDTO'];
export type Game = components['schemas']['GameStateDTO'];
export type GameSettings = components['schemas']['GameSettingsDTO'];
export type LatencySettings = components['schemas']['LatencySettingsDTO'];

const GAME_POLL_INTERVAL = 1000;

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  readonly #http = inject(HttpClient);

  readonly pollEnabled = signal(false);
  readonly poller = toSignal(interval(GAME_POLL_INTERVAL));

  readonly #players = httpResource<
    paths['/admin/players']['get']['responses'][200]['content']['application/json']
  >(() => 'admin/players');

  readonly #games = httpResource<
    paths['/admin/games']['get']['responses'][200]['content']['*/*']
  >(() => 'admin/games');

  readonly #settings = httpResource<
    paths['/admin/settings']['get']['responses'][200]['content']['*/*']
  >(() => 'admin/settings');

  readonly players = this.#players.asReadonly();
  readonly games = this.#games.asReadonly();
  readonly settings = this.#settings.asReadonly();

  reloadPlayers() {
    this.#players.reload();
  }

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

  updateNetworkSize(networkSize: number) {
    return this.#http.put<
      paths['/admin/settings/network-size/{networkSize}']['put']['responses'][200]['content']['*/*']
    >(`admin/settings/network-size/${networkSize}`, {});
  }

  updateLatencySettings(latencySettings: Partial<LatencySettings>) {
    return this.#http.put<
      paths['/admin/settings/latency']['put']['responses'][200]['content']['*/*']
    >(`admin/settings/latency`, latencySettings);
  }

  updateSettings(settings: Partial<GameSettings>) {
    forkJoin([
      this.updateNetworkSize(settings.networkSize ?? 0),
      this.updateLatencySettings(settings.latencySettings ?? {}),
    ]).subscribe(() => {
      this.#settings.reload();
    });
  }

  constructor() {
    effect(() => {
      this.poller();
      if (this.pollEnabled()) {
        this.#games.reload();
      }
    });
  }
}
