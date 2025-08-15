import { Component, computed, input } from '@angular/core';
import { Graph } from '../services/graph';
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
    @for (entry of leaderboard(); track entry.name) {
      <div>
        <span>{{ entry.name }}</span>
        <span>{{ entry.location }}</span>
        <span>{{ entry.score }}</span>
      </div>
    }
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
    const leaderboard = players.map((player) => {
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
    });
    return leaderboard;
  });
}
