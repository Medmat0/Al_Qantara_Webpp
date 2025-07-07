import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdhesionService } from '../../services/adhesion.service';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut: string;
  dateInscription?: string;
}

@Component({
  selector: 'app-adhesion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adhesion.component.html',
  styleUrls: ['./adhesion.component.scss']
})
export class AdhesionComponent implements OnInit {
  utilisateur: Utilisateur | null = null;
  dateInscriptionFr: string | null = null;
  showPayment = false;
  loadingPayment = false;
  paymentError: string | null = null;

  // Pour le don
  showDonationPayment = false;
  donationAmount: number = 10;
  customDonation: string = '';
  isCustomDonation: boolean = false; // Nouvelle variable pour gérer l'état personnalisé
  donationError: string | null = null;
  donationLabel: string = '';

  constructor(private adhesionService: AdhesionService) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('utilisateur');
    if (userStr) {
      try {
        this.utilisateur = JSON.parse(userStr);
        if (this.utilisateur?.dateInscription) {
          const date = new Date(this.utilisateur.dateInscription);
          this.dateInscriptionFr = date.toLocaleDateString('fr-FR');
        }
        // console.log('Utilisateur courant:', this.utilisateur);
      } catch (e) {
        this.utilisateur = null;
        this.dateInscriptionFr = null;
        // console.error('Erreur parsing utilisateur:', e);
      }
    } else {
      this.dateInscriptionFr = null;
      // console.log('Aucun utilisateur trouvé dans le localStorage');
    }
  }

  async payerAdhesion() {
    if (!this.utilisateur) return;
    
    this.loadingPayment = true;
    this.paymentError = null;
    
    try {
      // Utiliser le nouveau service d'adhésion
      this.adhesionService.creerPaiementAdhesion(Number(this.utilisateur.id)).subscribe({
        next: (response) => {
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          } else {
            throw new Error('URL de paiement non trouvée');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création du paiement:', error);
          this.paymentError = error?.error?.message || 'Erreur lors de l\'initialisation du paiement';
          this.loadingPayment = false;
        }
      });
    } catch (e: any) {
      this.paymentError = e?.message || 'Erreur lors de l\'initialisation du paiement';
      this.loadingPayment = false;
    }
  }

  // DON
  choisirMontantDon(montant: number|string) {
    if (montant === 'autre') {
      this.isCustomDonation = true;
      this.donationAmount = 0;
      this.customDonation = '';
    } else {
      this.isCustomDonation = false;
      this.donationAmount = Number(montant);
      this.customDonation = '';
    }
  }

  setCustomDonation(event: any) {
    const val = Number(event.target.value);
    this.donationAmount = isNaN(val) ? 0 : val;
    this.customDonation = event.target.value;
    // On reste en mode personnalisé même quand on tape
  }

  ouvrirModalDon() {
    this.showDonationPayment = true;
    this.donationError = null;
    this.donationLabel = 'Don à Al Qantara';
  }

  async payerDon() {
    // Utiliser la valeur appropriée selon le mode
    const montantAPayer = this.isCustomDonation ? this.donationAmount : this.donationAmount;
    
    if (!this.utilisateur || !montantAPayer || montantAPayer < 1) {
      this.donationError = 'Veuillez saisir un montant valide (minimum 1€).';
      return;
    }
    
    this.loadingPayment = true;
    this.donationError = null;
    
    try {
      // Utiliser le nouveau service de don
      this.adhesionService.creerPaiementDon(montantAPayer, Number(this.utilisateur.id)).subscribe({
        next: (response) => {
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          } else {
            throw new Error('URL de paiement non trouvée');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création du paiement don:', error);
          this.donationError = error?.error?.message || 'Erreur lors de l\'initialisation du paiement';
          this.loadingPayment = false;
        }
      });
    } catch (e: any) {
      this.donationError = e?.message || 'Erreur lors de l\'initialisation du paiement';
      this.loadingPayment = false;
    }
  }

  closeModalOnOverlay(event: MouseEvent) {
    this.showPayment = false;
  }
}

