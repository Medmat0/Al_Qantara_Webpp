import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss'
})
export class PaymentModalComponent {
  @Input() show = false;
  @Input() url = '';
  @Input() montant: number | null = null;
  @Output() close = new EventEmitter<void>();
} 