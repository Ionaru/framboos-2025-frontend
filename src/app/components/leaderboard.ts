import { Component, computed, input } from '@angular/core';

import { components } from '../api/schema';
import { Player } from '../services/player';

export type Ranking = components['schemas']['PlayerScoreDTO'][];
export type Stats = Record<
  string,
  Partial<components['schemas']['PlayerStatisticsDTO']>
>;

interface RankingEntry {
  emoji: string;
  location: string;
  score: number;
}

@Component({
  selector: 'app-leaderboard',
  template: `
    <div class="grid gap-x-4 gap-y-1 grid-cols-[auto_10rem_auto]">
      @for (entry of rankingEntries(); track entry.emoji) {
        <div class="grid col-span-full grid-cols-subgrid items-center">
          <span class="text-2xl">{{ entry.emoji }}</span>
          <span class="font-mono">{{ entry.location }}</span>
          <span class="text-lg">{{ entry.score }}</span>
        </div>
      }
    </div>
  `,
})
export class LeaderboardComponent {
  readonly ranking = input.required<Ranking>();
  readonly players = input.required<Player[]>();
  readonly stats = input.required<Stats>();

  readonly rankingEntries = computed<RankingEntry[]>(() => {
    const ranking = this.ranking();
    const players = this.players();
    const stats = this.stats();
    return ranking.map((entry) => ({
      emoji: players.find((player) => player.id === entry.playerId)!.emoji,
      location: stats[entry.playerId]?.location ?? '',
      score: entry.score,
    }));
  });
}
