import { Component, input } from '@angular/core';

@Component({
  selector: 'input[app-input]',
  template: `<ng-content />`,
  host: {
    class: `
      font-mono
      text-center
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
    `,
    '[class]': 'invalid() ? invalidStyle : normalStyle',
  },
})
export class Input {
  readonly invalid = input(false);

  readonly normalStyle =
    'shadow-[0_0_15px_0_#69a4e5] hover:border-[#6366f1] focus:border-[#6366f1]';
  readonly invalidStyle =
    'shadow-[0_0_15px_0_#ff0000] hover:border-[#ff0000] focus:border-[#ff0000]';
}
