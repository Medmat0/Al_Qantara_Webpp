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
    evenementId: number;
    utilisateurId: number;
    type: string;
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
    if (this.evenementId) {
      this.router.navigate(['/events', this.evenementId]);
    } else {
      this.router.navigate(['/events']);
    }
  }

  redirectNow(): void {
    this.redirectToEvent();
  }
}
