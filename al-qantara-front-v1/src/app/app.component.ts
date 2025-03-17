import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {HeaderComponent} from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomeComponent, HeaderComponent],
  template: `
    <app-header></app-header>
    <app-home></app-home>

  `,
  styles: [],
  standalone: true
})
export class AppComponent {
  title = 'al-qantara-front-v1-root';
}
