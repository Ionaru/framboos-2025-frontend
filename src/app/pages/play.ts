import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { GraphChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption } from 'echarts/types/dist/shared';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

import { Button } from '../components/button';
import { LeaderboardComponent } from '../components/leaderboard';
import { Page } from '../components/page';
import { GameStatistics } from '../services/admin';
import { GameService } from '../services/game';
import { PlayerService } from '../services/player';
import { locationStyles, LocationType } from '../styles/nodes';
import { GraphEdge, GraphNode } from '../utils/types';

echarts.use([GraphChart, GridComponent, CanvasRenderer]);

const LINE_MIN_WIDTH = 3;
const LINE_MAX_WIDTH = 10;

@Component({
  selector: 'app-play',
  imports: [Page, NgxEchartsDirective, LeaderboardComponent, Button],
  template: `
    <button
      id="play-home"
      app-button
      class="fixed top-4 left-4 z-10"
      (click)="goHome()"
    >
      Go home
    </button>
    <button
      id="play-logout"
      app-button
      class="fixed top-4 right-4 z-10"
      (click)="logout()"
    >
      Logout
    </button>
    <app-page class="flex flex-col items-center justify-center">
      @let gameState_ = gameState();
      @if (gameState_ === 'Waiting') {
        <h1 class="text-8xl my-4 text-center">💤</h1>
      } @else if (chartOption(); as option) {
        <div
          animate.enter="fade-in"
          style="width: 100vw; height: 100vw;"
          echarts
          (chartInit)="chartInit($event)"
          (chartFinished)="chartFinished()"
          [options]="option"
          [merge]="{
            series: [
              {
                data: nodes(),
                layout: nodePositions().size > 0 ? 'none' : 'force',
              },
            ],
          }"
        ></div>
      }
      <app-leaderboard
        class="absolute top-1/2 right-0 z-10 m-4 -translate-y-1/2"
        [ranking]="ranking()"
        [players]="players()"
        [stats]="stats()"
      />
    </app-page>
  `,
  providers: [
    provideEchartsCore({
      echarts,
    }),
  ],
})
export class PlayPage implements OnDestroy {
  readonly gameService = inject(GameService);
  readonly playerService = inject(PlayerService);
  readonly router = inject(Router);

  readonly playerId = input<string>();
  readonly gameStatistics = input<GameStatistics>();
  readonly adminOverride = input(false);

  readonly chartOption = signal<EChartsOption | undefined>(undefined);
  readonly nodePositions = signal<Map<string, [number, number]>>(new Map());

  readonly gameState = computed(() => {
    const game = this.gameService.game();
    if (!game) {
      return 'Loading';
    }
    return game.state;
  });

  readonly nodes = computed(() => {
    const graph = this.gameService.network();
    const player = this.playerService.player();
    const game = this.gameService.game();
    const state = this.gameStatistics();
    if (!graph || !player) {
      return [];
    }
    const nodePositions = this.nodePositions();
    const location = this.gameService.game()?.location;
    return graph.nodes.map<GraphNode>((node) => {
      const graphNode: GraphNode = {
        label: {
          show: true,
          formatter: '{b}',
        },
        itemStyle: locationStyles.get(LocationType.NORMAL),
        id: node,
        value: node,
        x: nodePositions.get(node)?.[0],
        y: nodePositions.get(node)?.[1],
      };

      if (location === node) {
        graphNode.itemStyle = locationStyles.get(LocationType.PLAYER);
        graphNode.name = player.emoji;
      }

      if (state?.dataSources?.[node] || game?.dataSources?.[node]) {
        graphNode.itemStyle = locationStyles.get(LocationType.DATA);
      }

      if (state?.honeypots?.[node] || game?.placedHoneypot === node) {
        graphNode.itemStyle = locationStyles.get(LocationType.TRAP);
      }

      return graphNode;
    });
  });

  readonly edges = computed(() => {
    const graph = this.gameService.network();
    if (!graph) {
      return [];
    }
    const maxLatency = Math.max(...graph.edges.map((edge) => edge.latency));
    return [
      ...graph.edges.map<GraphEdge>((edge) => ({
        source: edge.from,
        target: edge.to,
        lineStyle: {
          color: '#69a4e5',
          shadowBlur: 10,
          shadowColor: 'black',
          opacity: 0.4,
          width: Math.max(
            LINE_MIN_WIDTH,
            Math.min(
              LINE_MAX_WIDTH,
              (edge.latency / maxLatency) * LINE_MAX_WIDTH,
            ),
          ),
          curveness: 0.1,
        },
      })),
    ];
  });

  readonly ranking = computed(() => {
    const game = this.gameService.game();
    const player = this.playerService.player();
    if (!game || !player) {
      return [];
    }
    return [{ playerId: player.id, score: game.points }];
  });

  readonly players = computed(() => {
    const player = this.playerService.player();
    if (!player) {
      return [];
    }
    return [player];
  });

  readonly stats = computed(() => {
    const game = this.gameService.game();
    const player = this.playerService.player();
    if (!game || !player) {
      return {};
    }
    return {
      [player.id]: {
        location: game.location,
        action: 'Move' as const,
        points: game.points,
        lastUpdated: new Date().toISOString(),
      },
    };
  });

  constructor() {
    effect(() => {
      const playerId = this.playerId();
      if (playerId) {
        this.playerService.playerId.set(playerId);
      }
    });

    effect(() => {
      const links = this.edges();

      this.chartOption.set(undefined);
      this.nodePositions.set(new Map());

      setTimeout(() => {
        this.chartOption.set({
          series: [
            {
              animation: false,
              name: 'Graph',
              type: 'graph',
              data: untracked(this.nodes),
              links,
              layout: 'force',
              symbolSize: 25,
              force: {
                gravity: 0.4,
                edgeLength: 1,
                repulsion: 150,
                layoutAnimation: false,
              },
            },
          ],
        });
      }, 0);
    });
  }

  readonly chartInstance = signal<echarts.ECharts | undefined>(undefined);

  chartInit(chart: echarts.ECharts) {
    this.chartInstance.set(chart);
  }

  chartFinished() {
    if (this.nodePositions().size > 0) {
      return;
    }
    const chart = this.chartInstance();
    if (!chart) {
      throw new Error('Chart not found');
    }
    // @ts-expect-error - Private method
    const model = chart.getModel();
    const series = model.getSeriesByIndex(0);
    const nodeData = series.getData();

    const nodes = this.gameService.network()?.nodes;

    const positions = new Map<string, [number, number]>();
    nodes?.forEach((node, index) => {
      const layout = nodeData.getItemLayout(index) as [number, number];
      positions.set(node, layout);
    });

    this.nodePositions.set(positions);
  }

  ngOnDestroy() {
    this.playerService.playerId.set(undefined);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  logout() {
    sessionStorage.removeItem('playerId');
    sessionStorage.removeItem('playerPassword');
    this.router.navigate(['/']);
  }
}
