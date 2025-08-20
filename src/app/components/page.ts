import { Component } from '@angular/core';

@Component({
  selector: 'app-page',
  template: `<ng-content />`,
  host: {
    class: 'h-screen w-screen block relative',
  },
})
export class Page {}
