import { Component } from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {NavBarComponent} from './shared/components/nav-bar/nav-bar.component';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent],
  template: `
    <main>
      <app-nav-bar [showButtons]="showButtons"></app-nav-bar>
      <router-outlet></router-outlet>
    </main>


  `,
  styles: [],
  standalone: true
})
export class AppComponent {
  title = 'al-qantara-front-v1-root';

  showButtons: boolean = true;

  constructor(router: Router) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if(val.url === '/auth/reset-password' || val.url === '/auth/login' || val.url === '/auth/register') {
          this.showButtons = false;
        }else {
          this.showButtons = true;
        }
      }

    });
  }
}
