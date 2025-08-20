import { Component, computed, input } from '@angular/core';
import { NodeLocation } from '../services/player-locations';
import { GraphSeriesOption } from 'echarts/charts';

interface LeaderboardEntry {
  name: string;
  score: number;
  location: string;
}

type Unpacked<T> = T extends (infer U)[] ? U : T;

@Component({
  selector: 'app-leaderboard',
  template: `
  <div class="grid gap-x-4 gap-y-1 grid-cols-[auto_10rem_auto]">
    @for (entry of leaderboard(); track entry.name) {
      <div class="grid col-span-full grid-cols-subgrid items-center">
        <span class="text-2xl font-bold">{{ entry.name }}</span>
        <span class="text-lg font-mono">{{ entry.location }}</span>
        <span class="text-lg">{{ entry.score }}</span>
      </div>
    }
  </div>
  `,
})
export class LeaderboardComponent {
  readonly locations = input<NodeLocation[]>();
  readonly nodes = input<Unpacked<GraphSeriesOption['data']>[]>();

  readonly leaderboard = computed(() => {
    const locations = this.locations();
    const nodes = this.nodes();
    if (!locations || !nodes) {
      return [];
    }
    const players = locations.flatMap((location) => location.players);
    return players.map((player) => {
      const objectNodes = nodes.filter(
        (node): node is { id: string; value: string } =>
          Boolean(
            node && typeof node === 'object' && 'id' in node && 'value' in node,
          ),
      );
      const node = objectNodes.find(
        (node) =>
          node.id ===
          locations.find((location) => location.players.includes(player))?.id,
      );
      return { name: player, score: 0, location: node?.value || 'NULL' };
    }).toSorted((a, b) => b.score - a.score);
  });
}
