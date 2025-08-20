import { getRandomItemFromArray } from '@ionaru/array-utils';
import { inject, Injectable, resource } from '@angular/core';
import { timer } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { GraphService } from './graph';
import { HttpClient, httpResource } from '@angular/common/http';

export interface Player {
  name: string;
  id: string;
  emoji: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  readonly #http = inject(HttpClient);

  readonly #players = httpResource<Player[]>(() => '/raspberry-byte-brawl/admin/players');

  readonly players = this.#players.asReadonly();

  deletePlayer(player: Player) {
    this.#http.delete(`/raspberry-byte-brawl/admin/players/${player.id}`).subscribe(() => {
      this.#players.reload();
    });
  }

  deleteAllPlayers() {
    this.#http.delete('/raspberry-byte-brawl/admin/players').subscribe(() => {
      this.#players.reload();
    });
  }
}