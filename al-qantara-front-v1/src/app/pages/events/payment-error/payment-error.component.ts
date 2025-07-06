import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-error.component.html',
  styleUrls: ['./payment-error.component.scss']
})
export class PaymentErrorComponent implements OnInit {
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

  contactSupport(): void {
    this.router.navigate(['/contacts']);
  }
}
