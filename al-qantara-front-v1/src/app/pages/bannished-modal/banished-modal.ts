import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-banished-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banished-modal.component.html',
  styleUrls: ['./banished-modal.scss']
})
export class BanishedModal {
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router) {}

  onCancel() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
