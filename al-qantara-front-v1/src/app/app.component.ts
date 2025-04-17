import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
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
  title = 'al-qantara-front-v1-root';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus().subscribe({
      next: () => console.log('Auth status checked successfully'),
      error: (err) => console.error('Error checking auth status:', err)
    });
  }
}
