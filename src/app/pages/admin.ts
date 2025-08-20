import { Component, inject } from '@angular/core';
import { Page } from '../components/page';
import { AdminService, Player } from '../services/admin';
import { Router } from '@angular/router';

@Component({
  template: `
    <app-page>
      <div class="p-4 flex flex-col items-center justify-center gap-4">
        <h1 class="text-2xl font-bold">Admin page</h1>
        <div class="flex flex-col items-center justify-center gap-4">
          <h2 class="text-xl font-bold">Players</h2>
          <ul>
            @for (player of players(); track player.id) {
              <li class="flex items-center gap-2 my-2">
                <span class="text-2xl">{{ player.emoji }}</span>
                <span>{{ player.name }}</span>
                <button
                  class="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                  (click)="deletePlayer(player)"
                >
                  Delete
                </button>
                <button
                  class="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
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
        <button
          class="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
          (click)="deleteAllPlayers()"
        >
          Delete all players
        </button>
        <button
          class="bg-primary text-white px-4 py-2 rounded cursor-pointer"
          (click)="goHome()"
        >
          Go home
        </button>
        <button
          class="bg-primary text-white px-4 py-2 rounded cursor-pointer"
          (click)="logout()"
        >
          Logout
        </button>
      </div>
    </app-page>
  `,
  imports: [Page],
})
export class AdminPage {
  readonly #router = inject(Router);

  readonly #adminService = inject(AdminService);

  readonly players = this.#adminService.players.value;

  logout() {
    sessionStorage.removeItem('adminPassword');
    this.#router.navigate(['/']);
  }

  goToPlayerGame() {}

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
}
