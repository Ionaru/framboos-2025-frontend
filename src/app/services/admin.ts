import { HttpClient, httpResource } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, interval } from 'rxjs';

import { components, paths } from '../api/schema';

import { Player } from './player';

export type GameSettings = components['schemas']['GameSettingsDTO'];
export type LatencySettings = components['schemas']['LatencySettingsDTO'];
export type GameStatistics = components['schemas']['GameStatisticsDTO'];
export type PlayerScore = components['schemas']['PlayerScoreDTO'];

const GAME_POLL_INTERVAL = 100;
const SLOW_GAME_POLL_INTERVAL = 3000;
const PLAYER_POLL_INTERVAL = 3000;

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  readonly #http = inject(HttpClient);

  readonly gamePollerEnabled = signal(false);
  readonly gamePoller = toSignal(interval(GAME_POLL_INTERVAL));

  readonly slowGamePollerEnabled = signal(false);
  readonly slowGamePoller = toSignal(interval(SLOW_GAME_POLL_INTERVAL));

  readonly playerPollerEnabled = signal(false);
  readonly playerPoller = toSignal(interval(PLAYER_POLL_INTERVAL));

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

  prepareFinalGame() {
    this.#http
      .post<
        paths['/admin/final-game/prepare']['post']['responses'][200]['content']
      >('admin/final-game/prepare', {})
      .subscribe(() => {
        this.#games.reload();
      });
  }

  startFinalGame() {
    this.#http
      .post<
        paths['/admin/final-game/start']['post']['responses'][200]['content']
      >('admin/final-game/start', {})
      .subscribe(() => {
        this.#games.reload();
      });
  }

  finishFinalGame() {
    return this.#http.post<
      paths['/admin/final-game/finish']['post']['responses'][200]['content']['*/*']
    >('admin/final-game/finish', {});
  }

  resetAllGames() {
    this.#http
      .post<
        paths['/admin/reset']['post']['responses'][200]['content']['*/*']
      >('admin/reset', {})
      .subscribe(() => {
        this.#games.reload();
      });
  }

  constructor() {
    effect(() => {
      this.gamePoller();
      if (this.gamePollerEnabled()) {
        this.#games.reload();
      }
    });

    effect(() => {
      this.slowGamePoller();
      if (this.slowGamePollerEnabled()) {
        this.#games.reload();
      }
    });

    effect(() => {
      this.playerPoller();
      if (this.playerPollerEnabled()) {
        this.#players.reload();
      }
    });
  }
}
