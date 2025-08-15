import { Component } from '@angular/core';

@Component({
  selector: 'app-raspberry-emoji',
  template: `🍇`,
  styles: `
    :host {
      filter: hue-rotate(90deg);
    }
  `,
})
export class RaspberryEmoji {}
