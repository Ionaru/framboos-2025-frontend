import { GraphSeriesOption } from "echarts/charts";

export type Unpacked<T> = T extends (infer U)[] ? U : T;

export type GraphNode = Unpacked<GraphSeriesOption['data']>;
export type GraphEdge = Unpacked<Exclude<GraphSeriesOption['links'], undefined>>;

export type GraphNodeStyle = Unpacked<GraphSeriesOption['itemStyle']>;
