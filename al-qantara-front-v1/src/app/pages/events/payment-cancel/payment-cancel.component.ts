import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-cancel.component.html',
  styleUrls: ['./payment-cancel.component.scss']
})
export class PaymentCancelComponent implements OnInit {
  evenementId: string | null = null;
  utilisateurId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.evenementId = params['evenementId'];
      this.utilisateurId = params['utilisateurId'];
    });
  }

  retryPayment(): void {
    if (this.evenementId) {
      this.router.navigate(['/events', this.evenementId]);
    } else {
      this.router.navigate(['/events']);
    }
  }

  goToEvents(): void {
    this.router.navigate(['/events']);
  }
}
