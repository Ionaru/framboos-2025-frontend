import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <h1>Home</h1>
    <a routerLink="/admin">Admin</a>
  `,
})
export class HomePage {}
