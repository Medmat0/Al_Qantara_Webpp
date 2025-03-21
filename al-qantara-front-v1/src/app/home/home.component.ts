import { Component } from '@angular/core';
import { HeaderComponent } from '../home-components/header/header.component';
import {HomeContentComponent} from '../home-components/home-content/home-content.component';

@Component({
  selector: 'app-home-header',
  template: `
    <app-header></app-header>
    <app-home-content></app-home-content>
  `,
  standalone: true,
  imports: [HomeContentComponent, HeaderComponent]
})
export class HomeComponent {}
