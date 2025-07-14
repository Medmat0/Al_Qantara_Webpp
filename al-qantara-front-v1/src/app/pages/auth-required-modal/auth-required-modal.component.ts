import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-required-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-required-modal.component.html',
  styleUrls: ['./auth-required-modal.component.scss']
})
export class AuthRequiredModalComponent {
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router) {}

  onLogin() {
    this.router.navigate(['auth/login']);
    this.close.emit();
  }

  onCancel() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
