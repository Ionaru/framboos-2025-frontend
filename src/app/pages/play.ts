import {
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Page } from '../components/page';

import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
// import echarts core
import * as echarts from 'echarts/core';
import { EChartsOption, GraphSeriesOption } from 'echarts/types/dist/shared';

import { GraphChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { GraphService } from '../services/graph';
import { PlayerLocationsService } from '../services/player-locations';
echarts.use([GraphChart, GridComponent, CanvasRenderer]);

const LINE_MIN_WIDTH = 3;
const LINE_MAX_WIDTH = 10;

type Unpacked<T> = T extends (infer U)[] ? U : T;

@Component({
  imports: [Page, NgxEchartsDirective],
  template: `
    <app-page class="flex flex-col items-center justify-center">
      @if (chartOption(); as option) {
        <div
          style="width: 100vw; height: 100vw;"
          echarts
          (chartInit)="chartInit($event)"
          (chartFinished)="chartFinished()"
          [options]="option"
          [merge]="{ series: [{ data: nodes(), layout: nodePositions().size > 0 ? 'none' : 'force' }] }"
          class="demo-chart"
        ></div>
      }
    </app-page>
  `,
  providers: [
    provideEchartsCore({
      echarts,
    }),
  ],
})
export class PlayPage {
  readonly size = signal(75);

  readonly chart = viewChild<NgxEchartsDirective>('chart');

  setSize(input: string) {
    this.size.set(Number(input));
  }

  printOptions() {
    const chart = this.chartInstance();
    if (!chart) {
      return;
    }
    // @ts-expect-error
    const options = chart.getModel();
    const data = options.getSeriesByType('graph')[0].getData();
    const node = this.graphService.graph.value()?.nodes[0];
  }

  readonly position = signal<string>('');
  readonly nodePositions = signal<Map<string, [number, number]>>(new Map());

  readonly nodes = computed(() => {
    const graph = this.graphService.graph.value();
    if (!graph) {
      return [];
    }
    const position = this.position();
    const nodePositions = this.nodePositions();
    const locations = this.playerLocationsService.locations.value();
    return graph.nodes.map<Unpacked<GraphSeriesOption['data']>>((node) => {
      const location = locations?.find((location) => location.id === node.id);
      return ({
        label: {
          show: true,
          formatter: '{b}'
        },
        name: location?.players.join(''),
        // { color , borderColor , borderWidth , borderType , borderDashOffset , borderCap , borderJoin , borderMiterLimit , shadowBlur , shadowColor , shadowOffsetX , shadowOffsetY , opacity }
        itemStyle: {
          // color: location?.players.length && location.players.length > 0 ? 'rgba(255, 0, 0, 0.5)' : 'transparent',
          color: '#121212',
          borderColor: '#69a4e5',
          borderWidth: 1,
        },
        id: node.id,
        x: nodePositions.get(node.id)?.[0],
        y: nodePositions.get(node.id)?.[1],
      });
    });
  });

  readonly edges = computed(() => {
    const graph = this.graphService.graph.value();
    if (!graph) {
      return [];
    }
    const maxLatency = Math.max(...graph.edges.map((edge) => edge.latency));
    const links = graph.edges.map((edge) => ({
      source: edge.from,
      target: edge.to,
      lineStyle: {
        color: '#69a4e5',
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
    return links;
  });

  randomPosition() {
    const graph = this.graphService.graph.value();
    if (!graph) {
      return;
    }
    this.position.set(
      graph.nodes[Math.floor(Math.random() * graph.nodes.length)].id,
    );
  }

  readonly graphService = inject(GraphService);
  readonly playerLocationsService = inject(PlayerLocationsService);
  readonly chartOption = signal<EChartsOption | undefined>(undefined);

  constructor() {
    effect(() => {
      this.graphService.size.set(this.size());
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
            // label: {
            //   show: true,
            //   position: 'right',
            //   formatter: '{b}'
            // },
            labelLayout: {
              hideOverlap: true,
            },
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
    
    const nodes = this.graphService.graph.value()?.nodes;

    const positions = new Map<string, any>();
    nodes?.forEach((node, index) => {
      const layout = nodeData.getItemLayout(index);
      positions.set(node.id, layout);
    });

    this.nodePositions.set(positions);
  }
}
