import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdhesionService } from '../../../services/adhesion.service';
import { AuthService } from '../../../member/services/auth.service';

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
  donationAmount: number | null = null; // Pour récupérer le montant du don
  countdown: number = 10;

  // États de traitement
  isProcessing: boolean = false;
  processingError: string | null = null;
  adhesionProcessed: boolean = false;

  // Données du paiement
  paymentData: PaymentData | null = null;
  eventName: string = '';
  payerName: string = '';
  amount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adhesionService: AdhesionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.utilisateurId = params['utilisateurId'];
      this.paymentType = params['type'] || 'event';
      this.donationAmount = params['amount'] ? parseFloat(params['amount']) : null;

      // Si utilisateurId n'est pas dans les paramètres URL, essayer de le récupérer depuis localStorage
      if (!this.utilisateurId) {
        const storedUser = localStorage.getItem('utilisateur');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            this.utilisateurId = userData.id?.toString() || null;
            console.log('📱 ID utilisateur récupéré depuis localStorage:', this.utilisateurId);
          } catch (error) {
            console.error('❌ Erreur lors du parsing des données utilisateur:', error);
          }
        }
      }

      console.log('🔍 Paramètres URL reçus:', {
        utilisateurId: this.utilisateurId,
        paymentType: this.paymentType,
        donationAmount: this.donationAmount
      });

      // Récupérer les données de paiement depuis HelloAsso (si disponibles)
      this.loadPaymentData();

      // Si c'est un paiement d'adhésion, traiter l'adhésion
      if (this.paymentType === 'adhesion' && this.utilisateurId) {
        console.log('✅ Conditions remplies pour processAdhesion - Démarrage...');
        this.processAdhesion();
      } else {
        console.log('❌ Conditions NOT remplies pour processAdhesion:', {
          paymentType: this.paymentType,
          isAdhesion: this.paymentType === 'adhesion',
          utilisateurId: this.utilisateurId,
          hasUserId: !!this.utilisateurId
        });
      }
    });

    // Démarrer le countdown de redirection
    this.startCountdown();
  }

  loadPaymentData(): void {
    // Prioriser les paramètres URL pour les dons
    if (this.paymentType === 'don' && this.donationAmount) {
      this.amount = this.donationAmount;
      this.eventName = `Don de ${this.donationAmount}€`;
    }

    // Essayer de récupérer les données depuis sessionStorage
    const paymentInfo = sessionStorage.getItem('helloasso_payment_data');
    if (paymentInfo) {
      try {
        this.paymentData = JSON.parse(paymentInfo);
        if (!this.eventName) {
          this.eventName = this.paymentData?.itemName || '';
        }
        this.payerName = `${this.paymentData?.payer.firstName} ${this.paymentData?.payer.lastName}`;
        if (!this.amount) {
          this.amount = this.paymentData?.totalAmount || 0;
        }
      } catch (e) {
        console.error('Erreur lors du parsing des données de paiement:', e);
      }
    }
  }

  /**
   * Traite l'adhésion après un paiement réussi
   */
  processAdhesion(): void {
    console.log('🚀 ProcessAdhesion démarré avec utilisateurId:', this.utilisateurId);
    
    if (!this.utilisateurId) {
      console.log('❌ Erreur: ID utilisateur manquant');
      this.processingError = 'ID utilisateur manquant';
      return;
    }

    this.isProcessing = true;
    this.processingError = null;

    const userId = parseInt(this.utilisateurId);
    console.log('📞 Appel API creerAdhesion avec userId:', userId);
    
    this.adhesionService.creerAdhesion(userId).subscribe({
      next: (response) => {
        console.log('✅ Adhésion créée avec succès:', response);
        this.adhesionProcessed = true;
        this.isProcessing = false;
        
        // Mettre à jour le localStorage avec les nouvelles données utilisateur
        this.updateUserInLocalStorage(response.data.utilisateur);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de l\'adhésion:', error);
        this.processingError = 'Erreur lors du traitement de l\'adhésion. Veuillez contacter le support.';
        this.isProcessing = false;
      }
    });
  }

  /**
   * Met à jour les données utilisateur dans le localStorage
   */
  updateUserInLocalStorage(utilisateur: any): void {
    try {
      const currentUser = JSON.parse(localStorage.getItem('utilisateur') || '{}');
      const updatedUser = {
        ...currentUser,
        ...utilisateur,
        role: utilisateur.role,
        statut: utilisateur.statut
      };
      
      localStorage.setItem('utilisateur', JSON.stringify(updatedUser));
      console.log('Données utilisateur mises à jour dans localStorage:', updatedUser);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du localStorage:', error);
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

  redirectToContact(): void {
    this.router.navigate(['/contacts']);
  }

  getPaymentTitle(): string {
    switch (this.paymentType) {
      case 'adhesion':
        if (this.isProcessing) {
          return 'Traitement de votre adhésion...';
        } else if (this.processingError) {
          return 'Erreur lors du traitement';
        } else if (this.adhesionProcessed) {
          return 'Adhésion confirmée !';
        } else {
          return 'Paiement reçu !';
        }
      case 'don':
        return 'Don effectué avec succès !';
      default:
        return 'Paiement réussi !';
    }
  }

  getPaymentMessage(): string {
    switch (this.paymentType) {
      case 'adhesion':
        if (this.isProcessing) {
          return 'Nous sommes en train de traiter votre adhésion. Veuillez patienter...';
        } else if (this.processingError) {
          return this.processingError;
        } else if (this.adhesionProcessed) {
          return 'Votre adhésion à Al Qantara a été confirmée. Vous êtes désormais membre de notre association !';
        } else {
          return 'Votre paiement a été reçu et votre adhésion est en cours de traitement.';
        }
      case 'don':
        const montantText = this.donationAmount ? ` de ${this.donationAmount}€` : '';
        return `Merci pour votre généreux don${montantText} ! Votre contribution nous aide à poursuivre notre mission.`;
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
