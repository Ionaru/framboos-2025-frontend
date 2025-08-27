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
  name: string;
  location: string;
  score: number;
}

@Component({
  selector: 'app-leaderboard',
  template: `
    <div class="grid gap-x-4 gap-y-4 grid-cols-[auto_auto_auto]">
      @for (entry of rankingEntries(); track entry.emoji) {
        <div class="grid col-span-full grid-cols-subgrid grid-rows-[1fr_1fr]">
          <span class="col-start-0 text-right">{{ entry.name }}</span>
          <pre class="col-start-0 font-mono grayscale"
            >{{ entry.location }} 📍</pre
          >
          <span class="text-2xl col-start-2 row-span-full self-center">{{
            entry.emoji
          }}</span>
          <span
            class="text-lg row-span-full col-start-3 self-center grayscale font-mono"
          >
            {{ entry.score }}
          </span>
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
      emoji:
        players.find((player) => player.id === entry.playerId)?.emoji ?? '🍇',
      name:
        players.find((player) => player.id === entry.playerId)?.name ??
        'Unknown Player',
      location: (stats[entry.playerId]?.location ?? 'localhost').padStart(
        15,
        ' ',
      ),
      score: entry.score,
    }));
  });
}
