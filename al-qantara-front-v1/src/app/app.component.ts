import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './member/components/nav-bar/nav-bar.component';
import { AuthService } from './member/services/auth.service';

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
export class AppComponent implements OnInit {
  title = 'Al Qantara';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus().subscribe({
      next: () => console.log('Auth status checked successfully'),
      error: (err) => {
        console.warn('User is not authenticated:', err.message || err);
      }
    });
  }
}
