import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Button } from '../components/button';
import { Page } from '../components/page';
import { AdminService } from '../services/admin';
import { Player } from '../services/player';

@Component({
  template: `
    <app-page>
      <div class="p-4 flex flex-col items-center justify-center gap-4">
        <h1 class="text-2xl">Admin page</h1>
        <div class="flex items-center justify-center gap-4">
          <button app-button [style]="'dangerous'" (click)="deleteAllPlayers()">
            Delete all players
          </button>
          <button app-button (click)="goToSettings()">Settings</button>
          <button app-button (click)="goHome()">Go home</button>
          <button app-button (click)="logout()">Logout</button>
        </div>
        <div class="flex flex-col items-center justify-center gap-4 mt-4">
          <h2 class="text-xl ">Players</h2>
          <ul class="grid grid-cols-4 gap-6">
            @for (player of players(); track player.id) {
              <li class="grid grid-cols-subgrid items-center col-span-full">
                <span class="text-2xl">{{ player.emoji }}</span>
                <span class="font-mono">{{ player.name }}</span>
                @if (hasGame(player)) {
                  <button app-button (click)="goToPlayerGame(player)">
                    Spectate
                  </button>
                }
                <button
                  class="col-start-4"
                  app-button
                  [style]="'dangerous'"
                  (click)="deletePlayer(player)"
                >
                  Delete
                </button>
              </li>
            } @empty {
              <li>No players</li>
            }
          </ul>
        </div>
      </div>
    </app-page>
  `,
  imports: [Page, Button],
})
export class AdminPage {
  readonly #router = inject(Router);

  readonly #adminService = inject(AdminService);

  readonly games = this.#adminService.games.value;

  readonly players = this.#adminService.players.value;

  logout() {
    sessionStorage.removeItem('adminPassword');
    this.#router.navigate(['/']);
  }

  goToPlayerGame(player: Player) {
    this.#router.navigate(['/spectate'], {
      queryParams: { playerId: player.id },
    });
  }

  deletePlayer(player: Player) {
    if (confirm(`Are you sure you want to delete ${player.name}?`)) {
      this.#adminService.deletePlayer(player);
    }
  }

  deleteAllPlayers() {
    if (confirm('Are you sure you want to delete all players?')) {
      this.#adminService.deleteAllPlayers();
    }
  }

  goHome() {
    this.#router.navigate(['/']);
  }

  goToSettings() {
    this.#router.navigate(['/settings']);
  }

  hasGame(player: Player) {
    return Boolean(this.games()?.practiceGames[player.id]);
  }
}
