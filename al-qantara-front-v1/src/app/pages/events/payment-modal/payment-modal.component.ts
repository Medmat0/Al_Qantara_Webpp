import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../member/services/auth.service';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../member/services/payment.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  templateUrl: './payment-modal.component.html',
  imports: [
    DatePipe,
    CommonModule
  ],
  styleUrl: './payment-modal.component.scss'
})
export class PaymentModalComponent {
  @Input() event: any;
  @Input() loading: boolean = false;
  @Input() errorMessage: string = '';
  @Output() close = new EventEmitter<void>();

  constructor(private http: HttpClient, private authService: AuthService, private paymentService: PaymentService) {}

  onClose(): void {
    this.close.emit();
  }

  async onPay(): Promise<void> {
    this.errorMessage = '';
    this.loading = true;
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
      if (!utilisateur || !utilisateur.nom || !utilisateur.prenom || !utilisateur.email || !utilisateur.id) {
        this.errorMessage = 'Impossible de récupérer les informations utilisateur.';
        console.error(this.errorMessage);
        this.loading = false;
        return;
      }

      if (
        utilisateur.id === this.event?.createur?.id ||
        utilisateur.email === this.event?.createur?.email
      ) {
        this.errorMessage = 'Le créateur de l\'événement ne peut pas payer pour son propre événement.';
        console.error(this.errorMessage);
        this.loading = false;
        return;
      }
      const body = {
        totalAmount: this.event?.prix,
        initialAmount: this.event?.prix,
        itemName: this.event?.titre,
        payer: {
          firstName: utilisateur.prenom,
          lastName: utilisateur.nom,
          email: utilisateur.email
        },
        metadata: {
          evenementId: this.event?.id,
          utilisateurId: utilisateur.id,
          type: 'EVENT_PARTICIPATION'
        }
      };
      this.paymentService.createCheckout(body).subscribe({
        next: (res: any) => {
          if (res && res.redirectUrl) {
            window.open(res.redirectUrl, '_blank');
          } else {
            this.errorMessage = 'Erreur lors de la génération du lien de paiement.';
            console.error(this.errorMessage);
          }
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur lors de la création du paiement.';
          console.error(this.errorMessage);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Erreur lors de la création du paiement.';
      console.error(this.errorMessage);
      this.loading = false;
    }
  }
}
