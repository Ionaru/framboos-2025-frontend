import { httpResource } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';

interface Graph {
  nodes: {
    id: string;
    name: string;
  }[];
  edges: {
    from: string;
    to: string;
    latency: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  readonly size = signal(10);
  readonly #url = computed(
    () =>
      `http://localhost:8080/raspberry-byte-brawl/game/network?size=${this.size()}`,
  );

  readonly graph = httpResource<Graph>(this.#url).asReadonly();
}
