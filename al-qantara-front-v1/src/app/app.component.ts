import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {HeaderComponent} from "./home-components/header/header.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomeComponent, HeaderComponent],
  template: `
    <main>
      <app-header></app-header>
      <router-outlet></router-outlet>
    </main>


  `,
  styles: [],
  standalone: true
})
export class AppComponent {
  title = 'al-qantara-front-v1-root';
}
