import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface PaymentData {
  totalAmount: number;
  initialAmount: number;
  itemName: string;
  payer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  metadata: {
    evenementId?: number;
    utilisateurId: number;
    type: string; // 'event', 'adhesion', 'don'
  };
}

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  evenementId: string | null = null;
  utilisateurId: string | null = null;
  paymentType: string = 'event'; // 'event', 'adhesion', 'don'
  countdown: number = 10;

  // Données du paiement
  paymentData: PaymentData | null = null;
  eventName: string = '';
  payerName: string = '';
  amount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.evenementId = params['evenementId'];
      this.utilisateurId = params['utilisateurId'];
      this.paymentType = params['type'] || 'event';

      // Récupérer les données de paiement depuis HelloAsso (si disponibles)
      this.loadPaymentData();
    });

    // Démarrer le countdown de redirection
    this.startCountdown();
  }

  loadPaymentData(): void {
    // Ici vous pouvez récupérer les données de paiement depuis votre backend
    // ou depuis les paramètres URL si HelloAsso les passe
    const paymentInfo = sessionStorage.getItem('helloasso_payment_data');
    if (paymentInfo) {
      try {
        this.paymentData = JSON.parse(paymentInfo);
        this.eventName = this.paymentData?.itemName || '';
        this.payerName = `${this.paymentData?.payer.firstName} ${this.paymentData?.payer.lastName}`;
        this.amount = this.paymentData?.totalAmount || 0;
      } catch (e) {
        console.error('Erreur lors du parsing des données de paiement:', e);
      }
    }
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.redirectToEvent();
      }
    }, 1000);
  }

  redirectToEvent(): void {
    if (this.paymentType === 'event' && this.evenementId) {
      this.router.navigate(['/events', this.evenementId]);
    } else if (this.paymentType === 'adhesion') {
      this.router.navigate(['/profile']);
    } else if (this.paymentType === 'don') {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/events']);
    }
  }

  redirectNow(): void {
    this.redirectToEvent();
  }

  getPaymentTitle(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'Adhésion confirmée !';
      case 'don':
        return 'Don effectué avec succès !';
      default:
        return 'Paiement réussi !';
    }
  }

  getPaymentMessage(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'Votre adhésion à Al Qantara a été confirmée. Vous êtes désormais membre de notre association !';
      case 'don':
        return 'Merci pour votre généreux don ! Votre contribution nous aide à poursuivre notre mission.';
      default:
        return 'Votre paiement a été traité avec succès. Vous recevrez un email de confirmation sous peu.';
    }
  }

  getRedirectMessage(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'Redirection vers votre profil dans';
      case 'don':
        return 'Redirection vers l\'accueil dans';
      default:
        return 'Redirection vers l\'événement dans';
    }
  }

  getRedirectButtonText(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'Voir mon profil';
      case 'don':
        return 'Retour à l\'accueil';
      default:
        return 'Aller à l\'événement maintenant';
    }
  }

  getSuccessIcon(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'fas fa-id-card';
      case 'don':
        return 'fas fa-heart';
      default:
        return 'fas fa-check-circle';
    }
  }

  getPaymentTypeLabel(): string {
    switch (this.paymentType) {
      case 'adhesion':
        return 'Adhésion';
      case 'don':
        return 'Don';
      default:
        return 'Événement';
    }
  }
}
