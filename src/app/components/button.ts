import { Component, input } from '@angular/core';

@Component({
  selector: 'button[app-button]',
  template: `<ng-content />`,
  host: {
    class: `
      bg-[#1c2128]
      text-white
      border-2
      border-[#121212]
      rounded-full
      px-4
      py-2
      cursor-pointer
      transition-all
      duration-300
      hover:shadow-none
      focus:outline-none
      focus:shadow-none
      disabled:opacity-50
      disabled:pointer-events-none
    `,
    '[class]': 'style() === "primary" ? primaryStyle : dangerousStyle',
  },
})
export class Button {
  readonly style = input<'primary' | 'dangerous'>('primary');

  readonly primaryStyle =
    'shadow-[0_0_15px_0_#69a4e5] hover:border-[#6366f1] focus:border-[#6366f1]';
  readonly dangerousStyle =
    'shadow-[0_0_15px_0_#ff0000] hover:border-[#ff0000] focus:border-[#ff0000]';
}
