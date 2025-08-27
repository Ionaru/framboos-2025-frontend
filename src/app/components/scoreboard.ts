import { Component, computed, input } from '@angular/core';

import { PlayerScore } from '../services/admin';
import { Player } from '../services/player';

interface ScoreEntry {
  id: string;
  emoji: string;
  name: string;
  score: number;
}

@Component({
  selector: 'app-scoreboard',
  template: `
    <div class="grid gap-x-4 gap-y-4 grid-cols-[auto_auto_auto] text-lg">
      @for (entry of scoreEntries(); track entry.id) {
        @if (entry.score > 0) {
          <div
            class="grid col-span-full grid-cols-subgrid"
            [class.text-3xl]="$first"
            [class.text-2xl]="$index === 1"
            [class.text-xl]="$index === 2"
          >
            <span class="col-start-0 text-right">
              <span
                [class.grayscale]="$index === 1"
                [class.hue-rotate-330]="$index === 2"
                [class.brightness-50]="$index === 2"
                [class.invisible]="$index > 2"
                >🏆</span
              >
              {{ entry.name }}
            </span>
            <span class="col-start-2 row-span-full text-center">{{
              entry.emoji
            }}</span>
            <span class="row-span-full col-start-3 grayscale">
              {{ entry.score }}
            </span>
          </div>
        }
      }
    </div>
  `,
})
export class ScoreboardComponent {
  readonly score = input.required<PlayerScore[]>();
  readonly players = input.required<Player[]>();

  readonly scoreEntries = computed<ScoreEntry[]>(() => {
    const score = this.score();
    const players = this.players();
    return score.map((entry) => ({
      id: entry.playerId,
      emoji:
        players.find((player) => player.id === entry.playerId)?.emoji ?? '🍇',
      name:
        players.find((player) => player.id === entry.playerId)?.name ??
        'Unknown Player',
      score: entry.score,
    }));
  });
}
