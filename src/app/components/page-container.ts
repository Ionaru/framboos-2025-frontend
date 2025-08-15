import { Component } from '@angular/core';
import { NgxDotpatternComponent } from '@omnedia/ngx-dotpattern';

@Component({
  selector: 'app-page-container',
  template: `
    <om-dotpattern>
      <ng-content />
    </om-dotpattern>
  `,
  styles: `
    :host {
    }
  `,
  imports: [NgxDotpatternComponent],
})
export class PageContainer {}
