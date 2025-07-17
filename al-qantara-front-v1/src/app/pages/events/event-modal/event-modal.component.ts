import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { RemboursementModalComponent } from '../remboursement-modal/remboursement-modal.component';
import { RatingModalComponent } from '../rating-modal/rating-modal.component';
import { AuthService } from '../../../member/services/auth.service';
import { EvenementService } from '../../../member/services/evenement.service';
import { Router } from '@angular/router';
import { CommunityResearchComponent } from '../../community/components/community-research/community-research.component';
import { AuthRequiredModalComponent } from '../../auth-required-modal/auth-required-modal.component';
import { FRONTEND_URL } from '../../../utils/config';
@Component({
  selector: 'app-event-modal',
  standalone: true,
  templateUrl: './event-modal.component.html',
  imports: [
    NgIf,
    FormsModule,
    DatePipe,
    NgForOf,
    CommonModule,
    PaymentModalComponent,
    CommunityResearchComponent,
    RemboursementModalComponent,
    RatingModalComponent,
    AuthRequiredModalComponent
  ],
  styleUrl: './event-modal.component.scss'
})
export class EventModalComponent implements OnChanges {
  // Services injectés
  authService = inject(AuthService);
  evenementService = inject(EvenementService);
  router = inject(Router);

  @Input() event: any;
  @Input() participation: any;
  @Input() isParticipating = false;
  @Input() loading = false;
  @Input() error = '';
  @Input() hasLikedEvenement = false;
  @Input() unsubscribeConfirmed = false;
  @Output() close = new EventEmitter<void>();
  @Output() like = new EventEmitter<void>();
  @Output() comment = new EventEmitter<string>();
  @Output() participate = new EventEmitter<void>();
  @Output() unsubscribe = new EventEmitter<void>();


  showToast = false;
  toastMessage = '';

  safeMapUrl: SafeResourceUrl | null = null;
  commentText = '';
  showCommentForm = false;
  showComments = false;

  showPaymentModal = false;
  errorMessage = '';
  loadingPayment = false;
  errorPaymentMessage = '';

  // Propriétés pour la demande de remboursement
  showRemboursementModal = false;
  canRequestRefund = false;
  hasRequestedRefund = false; // Nouvelle propriété pour tracker si l'utilisateur a déjà demandé un remboursement
  userHasUnsubscribed = false; // Nouvelle propriété pour tracker si l'utilisateur s'est désinscrit

  //share
  showShareMenu = false;
  @Output() shareByMessageEvent = new EventEmitter<any>();

  // Propriétés pour l'authentification
  userId: number | null = null;
  isAuthenticated = false;

  // Nouvelles propriétés pour les likes
  nombreLikes: number = 0;
  userHasLiked: boolean = false;
  likesLoading: boolean = false;

  showCommunityResearchPopup = false;
  communityIDResearched: number | null = null;

  // Ajout de la propriété pour contrôler l'affichage du modal auth-required
  showAuthRequiredModal = false;

  // Propriétés pour la notation
  showRatingModal = false;
  userHasRated = false;

  constructor(private sanitizer: DomSanitizer) {
    if (this.event && !Array.isArray(this.event.comments)) {
      this.event.comments = [];
    }

    // Gestion de l'authentification
    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['event'] && this.event) {
      // Vérifier si l'utilisateur a déjà demandé un remboursement pour cet événement
      this.checkRefundRequestStatus();

      // Récupérer l'événement complet avec les commentaires
      this.evenementService.getEvenementById(this.event.id).subscribe({
        next: (response) => {
          if (response) {
            // Mettre à jour l'événement avec les données complètes incluant les commentaires
            this.event = { ...this.event, ...response };
            if (!Array.isArray(this.event.comments)) {
              this.event.comments = [];
            }

            // Initialiser les données des likes depuis le backend
            this.nombreLikes = this.event.nombreLikes || 0;
            this.checkIfUserLiked();
            this.checkIfUserHasRated();
          }
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des commentaires:', error);
        }
      });

      this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.openstreetmap.org/export/embed.html?bbox=' +
        (this.event.longitude - 0.01) + ',' +
        (this.event.latitude - 0.01) + ',' +
        (this.event.longitude + 0.01) + ',' +
        (this.event.latitude + 0.01) +
        '&layer=mapnik&marker=' + this.event.latitude + ',' + this.event.longitude
      );
    }

    if (changes['isParticipating'] && !changes['isParticipating'].currentValue) {
      this.participation = null;
    }

    if (changes['unsubscribeConfirmed']) {
      // Si l'utilisateur vient de se désinscrire, sauvegarder l'état
      if (this.unsubscribeConfirmed && this.userId && this.event?.id) {
        const unsubscribeKey = `unsubscribed_${this.userId}_${this.event.id}`;
        localStorage.setItem(unsubscribeKey, 'true');
        this.userHasUnsubscribed = true;
      }
      this.checkCanRequestRefund();
    }
  }

  copyLink() {
    const url = `${FRONTEND_URL}/events/${this.event?.id}`;
    navigator.clipboard.writeText(url);
    this.showShareMenu = false;
    this.showToastMessage('Lien copié !');
  }

  shareByMessage() {
    this.shareByMessageEvent.emit(this.event);
    this.showShareMenu = false;
  }

  shareOnCommunity() {
    if (!this.checkAuthentication()) return;

    this.showCommunityResearchPopup = true;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '17px'; // Pour éviter le décalage de la scrollbar
  }


  shareOnLinkedIn() {
    const url = `/events/${this.event?.id}`;
    navigator.clipboard.writeText(url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    this.showShareMenu = false;
  }


  formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  isEventPassed(): boolean {
    if (!this.event || !this.event.dateFin) {
      return false;
    }
    const now = new Date();
    const eventEndDate = new Date(this.event.dateFin);
    return eventEndDate < now;
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      this.showAuthRequiredModal = true;
      return false;
    }
    return true;
  }

  onAddComment(evenement: any, commentText: string) {
    if (!this.checkAuthentication()) return;

    this.evenementService.addCommentToEvenement(evenement.id, commentText).subscribe({
      next: (res) => {
        console.log('Commentaire ajouté avec succès', res);
        // Ajoute le commentaire à l'événement localement
        if (!Array.isArray(evenement.comments)) {
          evenement.comments = [];
        }
        evenement.comments.push(res.commentaire);
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du commentaire', err);
      }
    });
  }

  handleCommentSubmit() {
    if (this.commentText.trim()) {
      this.onAddComment(this.event, this.commentText);
      this.commentText = '';
    }
  }

  onPayWithHelloAsso() {
    // Vérifier l'authentification avant de procéder à l'achat
    if (!this.checkAuthentication()) return;

    this.errorPaymentMessage = '';
    const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
    if (
      utilisateur &&
      (utilisateur.id === this.event?.createur?.id ||
        utilisateur.email === this.event?.createur?.email)
    ) {
      this.errorPaymentMessage = "Le créateur de l'événement ne peut pas acheter de billet pour son propre événement.";
      return;
    }
    this.showPaymentModal = true;
  }

  handleShare() {
    const subject = `Invitation à l'événement: ${this.event.titre}`;
    const body = `Bonjour,\n\nJe vous invite à l'événement "${this.event.titre}" qui se déroulera le ${this.formatDateTime(this.event.dateDebut)} à ${this.event.lieu}.\n\nPour plus d'informations, visitez notre site web.\n\nCordialement`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.loadingPayment = false;
    this.errorMessage = '';
  }

  get eventImage(): string {
    if (Array.isArray(this.event?.images) && this.event.images.length > 0 && this.event.images[0]) {
      return this.event.images[0];
    }
    return 'assets/main-icon.jpg';
  }

  /**
   * Vérifier si l'utilisateur connecté a déjà liké cet événement
   */
  checkIfUserLiked() {
    if (this.userId && this.event?.likes) {
      this.userHasLiked = this.event.likes.some((like: any) => like.utilisateurId === this.userId);
    }
  }

  /**
   * Vérifier si l'utilisateur connecté a déjà noté cet événement
   */
  checkIfUserHasRated() {
    if (this.userId && this.event?.ratings) {
      this.userHasRated = this.event.ratings.some((rating: any) => rating.utilisateur.id === this.userId);
      console.log('Vérification notation utilisateur:', {
        userId: this.userId,
        ratings: this.event.ratings,
        userHasRated: this.userHasRated
      });
    }
  }

  /**
   * Toggle le like sur l'événement
   */
  toggleLike() {
    if (!this.checkAuthentication()) return;

    if (this.likesLoading) return;

    this.likesLoading = true;

    this.evenementService.likeEvenement(this.event.id).subscribe({
      next: (response) => {
        console.log('Like toggled successfully:', response);

        // Mettre à jour l'état local en fonction de l'action effectuée
        if (this.userHasLiked) {
          // L'utilisateur avait déjà liké, donc on retire le like
          this.nombreLikes = Math.max(0, this.nombreLikes - 1);
          this.userHasLiked = false;

          // Retirer le like de la liste locale
          if (this.event.likes) {
            this.event.likes = this.event.likes.filter((like: any) => like.utilisateurId !== this.userId);
          }
        } else {
          // L'utilisateur n'avait pas liké, donc on ajoute le like
          this.nombreLikes = this.nombreLikes + 1;
          this.userHasLiked = true;

          // Ajouter le like à la liste locale
          if (!this.event.likes) {
            this.event.likes = [];
          }
          this.event.likes.push({
            id: Date.now(), // ID temporaire
            utilisateurId: this.userId
          });
        }

        // Mettre à jour le nombreLikes dans l'objet event
        this.event.nombreLikes = this.nombreLikes;

        this.likesLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du toggle du like:', error);
        this.likesLoading = false;
      }
    });
  }

  closeCommunityResearchPopup(communityID: number | null = null) {
    this.showCommunityResearchPopup = false;
    this.communityIDResearched = communityID;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  onCommunitySelected(communityId: number) {
    this.closeCommunityResearchPopup(communityId);
    console.log('Evenement:', this.event);
    this.router.navigate(
      ['/communities', communityId],
      {
        queryParams: {
          eventTitle: this.event.titre,
          eventDescription: this.event.description,
          link: window.location.href+"/"+ this.event.id,
        }
      }
    );
  }
  /**
   * Vérifier si l'utilisateur peut demander un remboursement
   */
  checkCanRequestRefund(): void {
    // L'utilisateur peut demander un remboursement si :
    // 1. Il s'est désinscrit de l'événement (via unsubscribeConfirmed OU userHasUnsubscribed)
    // 2. L'événement était payant
    // 3. Il n'a pas encore demandé de remboursement
    const hasUnsubscribed = this.unsubscribeConfirmed || this.userHasUnsubscribed;
    this.canRequestRefund = hasUnsubscribed && this.event?.isPayant && !this.hasRequestedRefund;
  }

  /**
   * Ouvrir la modal de demande de remboursement
   */
  openRemboursementModal(): void {
    if (!this.checkAuthentication()) return;
    this.showRemboursementModal = true;
  }

  /**
   * Fermer la modal de demande de remboursement
   */
  closeRemboursementModal(): void {
    this.showRemboursementModal = false;
  }

  /**
   * Gérer le succès de la demande de remboursement
   */
  onRemboursementSuccess(response: any): void {
    console.log('✅ Demande de remboursement envoyée avec succès:', response);

    // Marquer que l'utilisateur a demandé un remboursement
    this.hasRequestedRefund = true;
    this.canRequestRefund = false;

    // Sauvegarder dans localStorage pour persister l'état
    if (this.userId && this.event?.id) {
      const refundKey = `refund_requested_${this.userId}_${this.event.id}`;
      localStorage.setItem(refundKey, 'true');
    }

    alert('Votre demande de remboursement a été envoyée. Vous recevrez une réponse par email.');
  }


  /**
   * Ouvrir le modal de notation
   */
  openRatingModal(): void {
    if (!this.checkAuthentication()) return;
    this.showRatingModal = true;
  }

  /**
   * Fermer le modal de notation
   */
  closeRatingModal(): void {
    this.showRatingModal = false;
  }

  /**
   * Gérer le succès de la notation
   */
  onRatingSubmitted(): void {
    console.log('✅ Notation envoyée avec succès');

  }

  /**
   * Vérifier si l'utilisateur a déjà demandé un remboursement pour cet événement
   */
  checkRefundRequestStatus(): void {
    if (this.userId && this.event?.id) {
      const refundKey = `refund_requested_${this.userId}_${this.event.id}`;
      this.hasRequestedRefund = localStorage.getItem(refundKey) === 'true';

      // Vérifier si l'utilisateur s'est désinscrit de cet événement
      const unsubscribeKey = `unsubscribed_${this.userId}_${this.event.id}`;
      this.userHasUnsubscribed = localStorage.getItem(unsubscribeKey) === 'true';
    }
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
