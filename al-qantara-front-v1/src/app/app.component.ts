import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>


  `,
  styles: [],
  standalone: true
})
export class AppComponent {
  title = 'al-qantara-front-v1-root';
}
