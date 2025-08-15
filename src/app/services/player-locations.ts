import { httpResource } from '@angular/common/http';
import { getRandomItemFromArray } from "@ionaru/array-utils";
import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { of, timer } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { GraphService } from './graph';

interface Location {
  id: string;
  players: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PlayerLocationsService {

readonly #graphService = inject(GraphService);

  readonly trigger = toSignal(timer(0, 3000));

  readonly players = ['⛺', '🏠', '🏢', '🏬', '🏪', '🏫', '🏥'];

  readonly locations = resource({
    params: () => ({
      graph: this.#graphService.graph.value(),
      trigger: this.trigger(),
    }),
    loader: ({params}) => {
      console.log('Loading locations');
      const locations = params.graph?.nodes.map<Location>((node) => ({ id: node.id, players: [] }));
      if (!locations) {
        return Promise.resolve([]);
      }
      // For each player, place them somewhere on the graph, 2 players can be on the same node
      const playersToPlace = [...this.players];
      while (playersToPlace.length > 0) {
        const randomLocation = getRandomItemFromArray(locations);
        if (randomLocation) {
          randomLocation.players.push(playersToPlace.pop()!);
        }
      }
      return Promise.resolve(locations);
    },
  });
}
