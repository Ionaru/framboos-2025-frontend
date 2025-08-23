import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { Page } from '../components/page';

import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts/types/dist/shared';
import { GraphChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { LeaderboardComponent } from '../components/leaderboard';
import { GraphEdge, GraphNode } from '../utils/types';
import { getLocationType, locationStyles, LocationType } from '../styles/nodes';
import { GameService } from '../services/game';
import { PlayerService } from '../services/player';
echarts.use([GraphChart, GridComponent, CanvasRenderer]);

const LINE_MIN_WIDTH = 3;
const LINE_MAX_WIDTH = 10;

@Component({
  selector: 'app-play',
  imports: [Page, NgxEchartsDirective, LeaderboardComponent],
  template: `
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
        [locations]="[]"
        [nodes]="nodes()"
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
  readonly playerId = input<string>();
  readonly adminOverride = input(false);

  readonly nodePositions = signal<Map<string, [number, number]>>(new Map());

  readonly nodes = computed(() => {
    const graph = this.gameService.network();
    const player = this.playerService.player();
    if (!graph) {
      return [];
    }
    const nodePositions = this.nodePositions();
    const location = this.gameService.game()?.location;
    return graph.nodes.map<GraphNode>((node) => {
      const isOnLocation = location === node;
      const locationType = isOnLocation
        ? getLocationType(isOnLocation)
        : LocationType.NORMAL;
      const graphNode: GraphNode = {
        label: {
          show: true,
          formatter: '{b}',
        },
        name: isOnLocation ? player?.emoji : '',
        itemStyle: locationStyles.get(locationType),
        id: node,
        value: node,
        x: nodePositions.get(node)?.[0],
        y: nodePositions.get(node)?.[1],
      };

      return graphNode;
    });
  });

  readonly edges = computed(() => {
    const graph = this.gameService.network();
    if (!graph) {
      return [];
    }
    const maxLatency = Math.max(...graph.edges.map((edge) => edge.latency));
    return graph.edges.map<GraphEdge>((edge) => ({
      source: edge.from,
      target: edge.to,
      lineStyle: {
        color: '#186f84',
        shadowBlur: 10,
        shadowColor: '#6366f1',
        opacity: 1,
        width: Math.max(
          LINE_MIN_WIDTH,
          Math.min(
            LINE_MAX_WIDTH,
            (edge.latency / maxLatency) * LINE_MAX_WIDTH,
          ),
        ),
        curveness: 0.1,
      },
    }));
  });

  readonly gameService = inject(GameService);
  readonly playerService = inject(PlayerService);
  readonly chartOption = signal<EChartsOption | undefined>(undefined);

  constructor() {
    effect(() => {
      const playerId = this.playerId();
      if (playerId) {
        this.playerService.playerId.set(playerId);
      }
    });

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

    const positions = new Map<string, any>();
    nodes?.forEach((node, index) => {
      const layout = nodeData.getItemLayout(index);
      positions.set(node, layout);
    });

    this.nodePositions.set(positions);
  }

  ngOnDestroy() {
    this.playerService.playerId.set(undefined);
  }
}
