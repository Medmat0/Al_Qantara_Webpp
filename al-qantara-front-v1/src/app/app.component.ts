import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './member/components/nav-bar/nav-bar.component';
import { AuthService } from './member/services/auth.service';
import { AuthModalService } from './services/auth-modal.service';
import { AuthRequiredModalComponent } from './pages/auth-required-modal/auth-required-modal.component';
import { CommonModule } from '@angular/common';
import { ModalService } from './member/services/banishedmodal.service';
import {BanishedModal} from './pages/bannished-modal/banished-modal';
import {JoinModalComponent} from './pages/join-modal/join-modal.component';
import { JoinModalService } from './member/services/joinmodal.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavBarComponent,
    AuthRequiredModalComponent,
    BanishedModal,
    CommonModule,
    JoinModalComponent],
  template: `
    <main>
      <app-nav-bar></app-nav-bar>
      <router-outlet></router-outlet>

      <!-- Modal d'authentification global -->
      <app-auth-required-modal
        *ngIf="showAuthModal"
        (close)="onAuthModalClose()">
      </app-auth-required-modal>
      <app-banished-modal
        *ngIf="showBanishedModal"
        (close)="showBanishedModal = false">
      </app-banished-modal>
    </main>

    <app-join-modal
      *ngIf="showJoinModal"
      [communityId]="communityIdForJoinModal"
      (close)="onJoinModalClose()">
    </app-join-modal>
  `,
  styles: [],
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'Al Qantara';
  showAuthModal = false;
  showBanishedModal = false;
  showJoinModal = false;
  communityIdForJoinModal: string | null = null;


  constructor(
    private authService: AuthService,
    private authModalService: AuthModalService,
    private modalService: ModalService,
    private joinModalService: JoinModalService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus().subscribe({
      next: () => console.log('Auth status checked successfully'),
      error: (err) => {
        console.warn('User is not authenticated:', err.message || err);
      }
    });

    this.modalService.banishedModal$.subscribe(() => {
      this.showBanishedModal = true;
    });

    // Écouter l'état du modal d'authentification
    this.authModalService.showModal$.subscribe(show => {
      this.showAuthModal = show;
    });

    this.joinModalService.joinModal$.subscribe((communityId) => {
      this.communityIdForJoinModal = communityId;
      this.showJoinModal = true;
    });
  }

  onAuthModalClose() {
    this.authModalService.hideAuthModal();
  }

  onJoinModalClose() {
    this.showJoinModal = false;
  }
}
