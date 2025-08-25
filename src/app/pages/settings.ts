import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Button } from '../components/button';
import { Input } from '../components/input';
import { Page } from '../components/page';
import { AdminService, GameSettings, LatencySettings } from '../services/admin';

type FormModel<T> = {
  [K in keyof T]: T[K] extends object
    ? FormGroup<FormModel<T[K]>>
    : FormControl<T[K] | null>;
};

@Component({
  template: `
    <app-page>
      <div class="p-4 flex flex-col items-center justify-center gap-4">
        <h1 class="text-2xl">Settings</h1>
        <button app-button (click)="goBack()">Go back</button>
        <div class="flex flex-col items-center justify-center gap-4">
          <h2 class="text-xl">Settings</h2>
          @if (settings()) {
            <form
              [formGroup]="form"
              class="flex flex-col items-center justify-center gap-4"
              (ngSubmit)="onSubmit()"
            >
              <ul class="flex flex-col items-center justify-center gap-6">
                <li class="flex flex-col items-center justify-center gap-2">
                  <label for="networkSize">Network size</label>
                  <input
                    app-input
                    class="w-full"
                    type="number"
                    id="networkSize"
                    formControlName="networkSize"
                    [invalid]="form.get('networkSize')?.invalid ?? false"
                  />
                </li>
                <li
                  class="flex flex-col items-center justify-center gap-2"
                  formGroupName="latencySettings"
                >
                  <label for="baseDelay">Base delay</label>
                  <input
                    app-input
                    class="w-full"
                    type="number"
                    id="baseDelay"
                    formControlName="baseDelay"
                    [invalid]="
                      form.get('latencySettings.baseDelay')?.invalid ?? false
                    "
                  />
                </li>
                <li
                  class="flex flex-col items-center justify-center gap-2"
                  formGroupName="latencySettings"
                >
                  <label for="maxAdditionalDelay">Max additional delay</label>
                  <input
                    app-input
                    class="w-full"
                    type="number"
                    id="maxAdditionalDelay"
                    formControlName="maxAdditionalDelay"
                    [invalid]="
                      form.get('latencySettings.maxAdditionalDelay')?.invalid ??
                      false
                    "
                  />
                </li>
                <li
                  class="flex flex-col items-center justify-center gap-2"
                  formGroupName="latencySettings"
                >
                  <label for="latencyMultiplierForInvalidMoves">
                    Latency multiplier for invalid moves
                  </label>
                  <input
                    app-input
                    class="w-full"
                    type="number"
                    id="latencyMultiplierForInvalidMoves"
                    formControlName="latencyMultiplierForInvalidMoves"
                    [invalid]="
                      form.get(
                        'latencySettings.latencyMultiplierForInvalidMoves'
                      )?.invalid ?? false
                    "
                  />
                </li>
              </ul>
              <button
                app-button
                type="submit"
                class="mt-4"
                [disabled]="!form.valid"
              >
                Save
              </button>
            </form>
          } @else {
            <p>Loading...</p>
          }
        </div>
      </div>
    </app-page>
  `,
  imports: [Page, Button, ReactiveFormsModule, Input],
})
export class SettingsPage {
  readonly #router = inject(Router);

  readonly #adminService = inject(AdminService);

  readonly settings = this.#adminService.settings.value;

  readonly form = new FormGroup<FormModel<GameSettings>>({
    networkSize: new FormControl(this.settings()?.networkSize ?? 0, [
      Validators.required,
    ]),
    latencySettings: new FormGroup<FormModel<LatencySettings>>({
      baseDelay: new FormControl(
        this.settings()?.latencySettings?.baseDelay ?? 0,
        [Validators.required],
      ),
      maxAdditionalDelay: new FormControl(
        this.settings()?.latencySettings?.maxAdditionalDelay ?? 0,
        [Validators.required],
      ),
      latencyMultiplierForInvalidMoves: new FormControl(
        this.settings()?.latencySettings?.latencyMultiplierForInvalidMoves ?? 0,
        [Validators.required],
      ),
    }),
  });

  goBack() {
    this.#router.navigate(['/admin']);
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.#adminService.updateSettings(this.form.value as Partial<GameSettings>);
  }

  constructor() {
    effect(() => {
      this.form.patchValue(this.settings() ?? {});
    });
  }
}
