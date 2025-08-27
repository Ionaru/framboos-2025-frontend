import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Button } from '../components/button';
import { Page } from '../components/page';
import { AdminService } from '../services/admin';
import { Player } from '../services/player';

@Component({
  template: `
    <app-page class="overflow-y-auto">
      <button app-button class="absolute top-4 left-4 z-10" (click)="goHome()">
        Go home
      </button>
      <button app-button class="absolute top-4 right-4 z-10" (click)="logout()">
        Logout
      </button>
      <div class="p-4 flex flex-col items-center justify-center gap-8">
        <h1 class="text-2xl">Admin page</h1>
        <div class="flex items-center justify-center gap-4">
          <button app-button (click)="goToSettings()">Game Settings</button>
          <button app-button [style]="'dangerous'" (click)="resetAllGames()">
            Reset all games
          </button>
        </div>
        <h2 class="text-xl">Final Game</h2>
        <div class="flex items-center justify-center gap-4">
          <button app-button [style]="'dangerous'" (click)="prepareFinalGame()">
            Prepare Final Game
          </button>
          <button app-button [style]="'dangerous'" (click)="startFinalGame()">
            Start Final Game
          </button>
          <button app-button (click)="goToFinalGame()">Go to Final Game</button>
        </div>
        <div class="flex flex-col items-center justify-center gap-4 mt-4">
          <h2 class="text-xl">Players</h2>
          <ul class="grid grid-cols-[auto_auto_auto_auto] gap-6">
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
              <li class="col-span-full">🕷️ No players 🕸️</li>
            }
          </ul>
          <button app-button [style]="'dangerous'" (click)="deleteAllPlayers()">
            Delete all players
          </button>
        </div>
      </div>
    </app-page>
  `,
  imports: [Page, Button],
})
export class AdminPage implements OnInit, OnDestroy {
  readonly #router = inject(Router);

  readonly #adminService = inject(AdminService);

  readonly games = this.#adminService.games.value;

  readonly players = computed(() => {
    const players = this.#adminService.players.value();
    if (!players) {
      return [];
    }
    return players.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
        numeric: true,
      }),
    );
  });

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

  prepareFinalGame() {
    if (confirm('Are you sure you want to prepare the final game?')) {
      this.#adminService.prepareFinalGame();
    }
  }

  startFinalGame() {
    if (confirm('Are you sure you want to start the final game?')) {
      this.#adminService.startFinalGame();
      this.#router.navigate(['/finale']);
    }
  }

  goToFinalGame() {
    this.#router.navigate(['/finale']);
  }

  ngOnInit() {
    this.#adminService.playerPollerEnabled.set(true);
  }

  ngOnDestroy() {
    this.#adminService.playerPollerEnabled.set(false);
  }

  resetAllGames() {
    if (confirm('Are you sure you want to reset all games?')) {
      this.#adminService.resetAllGames();
    }
  }
}
