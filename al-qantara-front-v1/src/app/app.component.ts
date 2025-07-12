import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './member/components/nav-bar/nav-bar.component';
import { AuthService } from './member/services/auth.service';
import { AuthModalService } from './services/auth-modal.service';
import { AuthRequiredModalComponent } from './pages/auth-required-modal/auth-required-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent, AuthRequiredModalComponent, CommonModule],
  template: `
    <main>
      <app-nav-bar></app-nav-bar>
      <router-outlet></router-outlet>

      <!-- Modal d'authentification global -->
      <app-auth-required-modal
        *ngIf="showAuthModal"
        (close)="onAuthModalClose()">
      </app-auth-required-modal>
    </main>
  `,
  styles: [],
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'Al Qantara';
  showAuthModal = false;

  constructor(
    private authService: AuthService,
    private authModalService: AuthModalService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus().subscribe({
      next: () => console.log('Auth status checked successfully'),
      error: (err) => {
        console.warn('User is not authenticated:', err.message || err);
      }
    });

    // Écouter l'état du modal d'authentification
    this.authModalService.showModal$.subscribe(show => {
      this.showAuthModal = show;
    });
  }

  onAuthModalClose() {
    this.authModalService.hideAuthModal();
  }
}
