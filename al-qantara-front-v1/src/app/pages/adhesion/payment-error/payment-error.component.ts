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
  utilisateurId: string | null = null;
  paymentType: string = 'event';
  errorMessage: string = '';
  countdown: number = 15;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.utilisateurId = params['utilisateurId'];
      this.paymentType = params['type'] || 'event';
      this.errorMessage = params['error'] || 'Une erreur inattendue s\'est produite lors du traitement de votre paiement.';
    });

    this.startCountdown();
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.redirectToRetry();
      }
    }, 1000);
  }

  retryPayment(): void {
    if (this.paymentType === 'adhesion') {
      this.router.navigate(['/adhesion']);
    } else {
      this.router.navigate(['/events']);
    }
  }

  redirectToRetry(): void {
    this.retryPayment();
  }

  contactSupport(): void {
    this.router.navigate(['/contacts']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  getErrorTitle(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'Erreur lors du paiement de l\'adhésion';
      case 'don':
        return 'Erreur lors du don';
      default:
        return 'Erreur de paiement';
    }
  }

  getRetryButtonText(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'Réessayer l\'adhésion';
      case 'don':
        return 'Réessayer le don';
      default:
        return 'Réessayer le paiement';
    }
  }

  getRedirectMessage(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'Redirection vers l\'adhésion dans';
      case 'don':
        return 'Redirection vers les événements dans';
      default:
        return 'Redirection vers les événements dans';
    }
  }
}
