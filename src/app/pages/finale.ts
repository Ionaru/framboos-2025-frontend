import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
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
import { ScoreboardComponent } from '../components/scoreboard';
import { AdminService, PlayerScore } from '../services/admin';
import { locationStyles, LocationType } from '../styles/nodes';
import { GraphEdge, GraphNode } from '../utils/types';

echarts.use([GraphChart, GridComponent, CanvasRenderer]);

const LINE_MIN_WIDTH = 3;
const LINE_MAX_WIDTH = 10;

@Component({
  imports: [
    Page,
    NgxEchartsDirective,
    LeaderboardComponent,
    Button,
    ScoreboardComponent,
  ],
  template: `
    <button app-button class="fixed top-4 left-4 z-10" (click)="toAdmin()">
      Admin Panel
    </button>
    @let scoreBoard_ = scoreBoard();
    @if (finalGame(); as game) {
      <button
        app-button
        [style]="'dangerous'"
        class="fixed top-4 right-4 z-10"
        (click)="finishFinalGame()"
      >
        Finish Final Game
      </button>
      <h1 class="text-4xl absolute top-4 left-1/2 -translate-x-1/2 z-10 metal">
        🕸️ Final Game 🕸️
      </h1>
    } @else if (!scoreBoard_) {
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <h1 class="text-4xl my-4 text-center">Final Game inactive 💤</h1>
        <div class="flex items-center justify-center gap-4">
          <button app-button [style]="'dangerous'" (click)="prepareFinalGame()">
            Prepare Final Game
          </button>
          <button app-button [style]="'dangerous'" (click)="startFinalGame()">
            Start Final Game
          </button>
        </div>
      </div>
    } @else {
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <h1 class="text-6xl my-4 text-center metal">Final Game Scores</h1>
        <app-scoreboard [score]="scoreBoard_" [players]="players2()" />
      </div>
    }
    <app-page class="flex flex-col items-center justify-center">
      @if (chartOption(); as option) {
        <div
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
        [players]="play()"
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
export class FinalePage implements OnInit, OnDestroy {
  readonly adminService = inject(AdminService);
  readonly router = inject(Router);

  readonly finalGame = computed(
    () => this.adminService.games.value()?.finalGame,
  );
  readonly players = computed(
    () => this.adminService.games.value()?.players ?? {},
  );

  readonly nodePositions = signal<Map<string, [number, number]>>(new Map());
  readonly chartOption = signal<EChartsOption | undefined>(undefined);
  readonly scoreBoard = signal<PlayerScore[] | undefined>(undefined);

  readonly nodes = computed(() => {
    const graph = this.finalGame()?.network;
    if (!graph) {
      return [];
    }
    const nodePositions = this.nodePositions();

    const playerLocations = Object.entries(this.finalGame()?.players ?? {});
    const dataSources = Object.entries(this.finalGame()?.dataSources ?? {});
    const honeypots = Object.entries(this.finalGame()?.honeypots ?? {});
    const players = this.players();

    return graph.nodes.map<GraphNode>((node) => {
      const graphNode: GraphNode = {
        label: {
          show: true,
        },
        itemStyle: locationStyles.get(LocationType.NORMAL),
        id: node,
        value: node,
        x: nodePositions.get(node)?.[0],
        y: nodePositions.get(node)?.[1],
      };

      for (const [player, status] of playerLocations) {
        if (status.location === node) {
          graphNode.itemStyle = locationStyles.get(LocationType.PLAYER);
          graphNode.name = (graphNode.name ?? '') + players[player]?.emoji;
        }
      }

      for (const [dataSource] of dataSources) {
        if (dataSource === node) {
          graphNode.itemStyle = locationStyles.get(LocationType.DATA);
        }
      }

      for (const [honeypot] of honeypots) {
        if (honeypot === node) {
          graphNode.itemStyle = locationStyles.get(LocationType.TRAP);
        }
      }

      return graphNode;
    });
  });

  readonly edges = computed(() => {
    const graph = this.finalGame()?.network;
    if (!graph) {
      return [];
    }
    const maxLatency = Math.max(...graph.edges.map((edge) => edge.latency));
    return graph.edges.map<GraphEdge>((edge) => ({
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
            ((maxLatency - edge.latency) / maxLatency) * LINE_MAX_WIDTH,
          ),
        ),
        curveness: 0.1,
      },
    }));
  });

  readonly ranking = computed(() => {
    const game = this.finalGame();
    if (!game) {
      return [];
    }
    return game.ranking;
  });

  readonly play = computed(() => {
    return Object.values(this.players());
  });

  readonly players2 = computed(() => {
    return this.adminService.players.value() ?? [];
  });

  readonly stats = computed(() => {
    const game = this.finalGame();
    if (!game) {
      return {};
    }
    return game.players;
  });

  constructor() {
    const setInitialOptions = effect(() => {
      const data = this.nodes();
      const links = this.edges();

      if (data.length === 0) {
        return;
      }

      this.chartOption.set({
        series: [
          {
            animation: false,
            name: 'Graph',
            type: 'graph',
            data,
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
      setInitialOptions.destroy();
    });

    effect(() => {
      const scoreBoard = this.scoreBoard();
      this.adminService.gamePollerEnabled.set(!scoreBoard);
    });

    effect(() => {
      const game = this.finalGame();
      this.adminService.gamePollerEnabled.set(Boolean(game));
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

    const nodes = this.finalGame()?.network?.nodes;

    const positions = new Map<string, [number, number]>();
    nodes?.forEach((node, index) => {
      const layout = nodeData.getItemLayout(index) as [number, number];
      positions.set(node, layout);
    });

    this.nodePositions.set(positions);
  }

  toAdmin() {
    this.router.navigate(['/admin']);
  }

  ngOnInit() {
    this.adminService.gamePollerEnabled.set(true);
  }

  ngOnDestroy() {
    this.adminService.gamePollerEnabled.set(false);
  }

  prepareFinalGame() {
    if (confirm('Are you sure you want to prepare the final game?')) {
      this.adminService.prepareFinalGame();
    }
  }

  startFinalGame() {
    if (confirm('Are you sure you want to start the final game?')) {
      this.adminService.startFinalGame();
    }
  }

  finishFinalGame() {
    if (confirm('Are you sure you want to finish the final game?')) {
      this.adminService.finishFinalGame().subscribe((scores) => {
        this.adminService.reloadPlayers();
        this.scoreBoard.set([...scores]);
      });
    }
  }
}
