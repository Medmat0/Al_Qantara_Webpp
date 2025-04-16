// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent],
  template: `
    <main>
      <app-nav-bar></app-nav-bar>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [],
  standalone: true
})
export class AppComponent {
  title = 'al-qantara-front-v1-root';
}
