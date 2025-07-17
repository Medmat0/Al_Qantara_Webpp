import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EvenementService } from '../../../member/services/evenement.service';
import { AuthService } from '../../../member/services/auth.service';
import { EvenementPaymentService } from '../../../services/evenement-payment.service';

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
  countdown: number = 8; // Réduit à 8 secondes

  // États de traitement
  isProcessing: boolean = false;
  processingError: string | null = null;
  participationCreated: boolean = false;
  participationExists: boolean = false;

  // Données du paiement et de l'événement
  paymentData: PaymentData | null = null;
  eventName: string = '';
  eventData: any = null;
  payerName: string = '';
  amount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evenementService: EvenementService,
    private authService: AuthService,
    private evenementPaymentService: EvenementPaymentService
  ) {}

  ngOnInit(): void {
    console.log('🎯 Initialisation de la page de succès événement');
    
    // Le guard s'est déjà occupé de la validation du token de sécurité
    this.validatePageAccess();
    
    this.route.queryParams.subscribe(params => {
      this.evenementId = params['evenementId'];
      this.utilisateurId = params['utilisateurId'];

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

      // Validation finale des paramètres
      if (!this.validateRequiredParams()) {
        this.router.navigate(['/events']);
        return;
      }

      console.log('🔍 Paramètres URL reçus:', {
        evenementId: this.evenementId,
        utilisateurId: this.utilisateurId
      });

      // Charger les informations de l'événement
      this.loadEventData();

      // Récupérer les données de paiement depuis HelloAsso (si disponibles)
      this.loadPaymentData();

      // Créer automatiquement la participation à l'événement
      if (this.evenementId && this.utilisateurId) {
        console.log('✅ Conditions remplies pour créer la participation - Démarrage...');
        this.createEventParticipation();
      }
    });

    // Démarrer le countdown de redirection
    this.startCountdown();
  }

  /**
   * Valide l'accès à cette page avec des vérifications supplémentaires
   */
  private validatePageAccess(): void {
    // Vérifier si on arrive depuis une source légitime
    const referrer = document.referrer;
    const currentDomain = window.location.origin;
    
    // Si pas de referrer ou referrer externe suspect
    if (!referrer || (!referrer.startsWith(currentDomain) && !referrer.includes('helloasso'))) {
      console.log('⚠️ Accès direct ou referrer suspect détecté pour événement');
    }
  }

  /**
   * Valide que tous les paramètres requis sont présents
   */
  private validateRequiredParams(): boolean {
    return !!(this.utilisateurId && this.evenementId);
  }

  /**
   * Charge les données de l'événement
   */
  loadEventData(): void {
    if (!this.evenementId) return;
    
    const eventId = parseInt(this.evenementId);
    this.evenementService.getEvenementById(eventId).subscribe({
      next: (event) => {
        this.eventData = event;
        this.eventName = event?.titre || '';
        this.amount = event?.prix || 0;
        console.log('📅 Données de l\'événement chargées:', this.eventData);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de l\'événement:', error);
      }
    });
  }

  /**
   * Crée automatiquement la participation à l'événement après un paiement réussi
   */
  createEventParticipation(): void {
    console.log('🚀 Création de la participation démarrée pour événement:', this.evenementId);
    
    if (!this.evenementId || !this.utilisateurId) {
      console.log('❌ Erreur: Paramètres manquants pour la participation');
      this.processingError = 'Paramètres manquants pour créer la participation';
      return;
    }

    this.isProcessing = true;
    this.processingError = null;

    const eventId = parseInt(this.evenementId);
    console.log('📞 Appel API addParticipationToEvenement avec eventId:', eventId);
    
    this.evenementService.addParticipationToEvenement(eventId).subscribe({
      next: (response) => {
        console.log('✅ Participation créée avec succès:', response);
        this.participationCreated = true;
        this.isProcessing = false;
        
        // Succès : message personnalisé
        console.log('🎊 Participation confirmée ! Redirection vers l\'événement...');
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la participation:', error);
        
        // Vérifier si c'est une erreur de participation déjà existante
        if (error.status === 400 && error.error?.message?.includes('déjà inscrit')) {
          console.log('ℹ️ L\'utilisateur est déjà inscrit à cet événement');
          this.participationExists = true;
          this.participationCreated = true; // Considérer comme succès
          this.processingError = null;
        } else {
          this.processingError = 'Erreur lors de la création de votre participation. Veuillez contacter le support.';
        }
        this.isProcessing = false;
      }
    });
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
