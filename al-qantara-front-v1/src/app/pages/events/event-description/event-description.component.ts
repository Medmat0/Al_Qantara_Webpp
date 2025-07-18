import {Component, inject} from '@angular/core';
import {AuthService} from '../../../member/services/auth.service';
import {EvenementService} from '../../../member/services/evenement.service';
import {Evenement, LikeEvenement} from '../../../member/models/evenement';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import {MessagerieService} from '../../../member/services/messagerie.service';
import {UsersListComponent} from '../../messaging/components/users-list/users-list.component';
import {PaymentModalComponent} from '../payment-modal/payment-modal.component';
import {CommunityPostResearchComponent} from '../../community/components/community-post-research/community-post-research.component';
import {CommunityResearchComponent} from '../../community/components/community-research/community-research.component';
import {RemboursementModalComponent} from '../remboursement-modal/remboursement-modal.component';
import {RatingModalComponent} from '../rating-modal/rating-modal.component';
import {AuthRequiredModalComponent} from '../../auth-required-modal/auth-required-modal.component';


@Component({
  selector: 'app-event-description',
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
    DatePipe,
    UsersListComponent,
    PaymentModalComponent,
    CommunityPostResearchComponent,
    CommunityResearchComponent,
    RemboursementModalComponent,
    RatingModalComponent,
    AuthRequiredModalComponent
  ],
  templateUrl: './event-description.component.html',
  standalone: true,
  styleUrl: './event-description.component.scss'
})
export class EventDescriptionComponent {

  authService = inject(AuthService);
  evenementService= inject(EvenementService);
  messagerieService = inject(MessagerieService);

  userId: number | null = null;
  isAuthenticated = false;

  evenement: any | null = null;
  evenementId: number | any = null;

  commentText = '';
  safeMapUrl: any = null;

  showShareMenu = false;
  users: any[] = []; // Liste des utilisateurs pour la modal de partage
  showUsersModal = false; // Contrôle l'affichage de la modal de partage

  // Toast notification
  showToast = false;
  toastMessage = '';

  // propriétés pour la gestion visuelle de la description
  loading = false;
  error = '';
  hasLikedEvenement = false;
  isParticipating = false;
  participation: any = null;
  unsubscribeConfirmed: boolean = false;
  errorPaymentMessage = '';
  showPaymentModal = false;

  nombreLikes: number = 0;
  userHasLiked: boolean = false;
  likesLoading: boolean = false;

  showCommunityResearchPopup = false;
  communityIDResearched: number | null = null;

  // Propriété pour contrôler l'affichage du modal auth-required
  showAuthRequiredModal = false;

  // Propriétés pour le modal de notation
  showRatingModal = false;
  userHasRated = false;

  // Remboursement
  canRequestRefund: boolean = false;
  hasRequestedRefund: boolean = false;
  showRemboursementModal: boolean = false;
  userHasUnsubscribed: boolean = false; // Nouvelle propriété pour tracker si l'utilisateur s'est désinscrit

  openRemboursementModal() {
    this.showRemboursementModal = true;
  }

  closeRemboursementModal() {
    this.showRemboursementModal = false;
  }

  onRemboursementSuccess(event: any) {
    console.log('✅ Demande de remboursement envoyée avec succès:', event);

    // Marquer que l'utilisateur a demandé un remboursement
    this.hasRequestedRefund = true;
    this.canRequestRefund = false;
    this.showRemboursementModal = false;

    // Sauvegarder dans localStorage pour persister l'état
    if (this.userId && this.evenement?.id) {
      const refundKey = `refund_requested_${this.userId}_${this.evenement.id}`;
      localStorage.setItem(refundKey, 'true');
    }

    this.showToastMessage('Votre demande de remboursement a été envoyée. Vous recevrez une réponse par email.');
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef) {
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

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.evenementId = id ? +id : null;
      if (this.evenementId !== null) {
        this.evenementService.getEvenementById(this.evenementId).subscribe({
          next: (response) => {
            if (!response || !response.id) {
              this.router.navigate(['/not-found']);
              return;
            }
            this.evenement = response;

            this.nombreLikes = this.evenement.nombreLikes || 0;
            this.checkIfUserLiked();
            this.checkIfUserHasRated();
            // Gestion remboursement - utilise la logique du modal
            this.checkRefundRequestStatus();
            this.checkCanRequestRefund();
            if (this.userId && Array.isArray(this.evenement.likes)) {
              this.hasLikedEvenement = this.evenement.likes.some((like: LikeEvenement) => like.utilisateurId === this.userId);
            } else {
              this.hasLikedEvenement = false;
            }
            if (!this.isAuthenticated) {

            }else {
              this.evenementService.checkParticipation(this.evenementId).subscribe({
                next: (res) => {
                  console.log('Vérification de la participation réussie', res);
                  this.isParticipating = !!res.participation;
                  this.participation = res.participation;
                },
                error: (err) => {
                  console.error('Erreur lors de la vérification de la participation', err);
                }
              });

            }

            // Génère l'URL de la carte ici, après avoir reçu l'événement
            if (this.evenement.latitude && this.evenement.longitude) {
              this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                'https://www.openstreetmap.org/export/embed.html?bbox=' +
                (this.evenement.longitude - 0.01) + ',' +
                (this.evenement.latitude - 0.01) + ',' +
                (this.evenement.longitude + 0.01) + ',' +
                (this.evenement.latitude + 0.01) +
                '&layer=mapnik&marker=' + this.evenement.latitude + ',' + this.evenement.longitude
              );
            } else {
              this.safeMapUrl = null;
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Erreur lors du fetch de l\'événement:', error);
            this.router.navigate(['/not-found']);
          }
        });
      }
    });
  }


  copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    this.showShareMenu = false;
    this.showToastMessage('Lien copié !');
  }

  shareByMessage() {
    this.openModal();
    this.showShareMenu = false;
  }

  shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    this.showShareMenu = false;
  }

  openModal() {
    this.messagerieService.getAllUsers().subscribe({
      next: res => {
        this.users = res.data;
        this.showUsersModal = true;
      }
    });
  }

  handleShareEventByMessage(user: any) {
    if (!this.checkAuthentication()) return;
    console.log("test user choisi",user);

    const preloadedMessage = {
      destinataireId: user,
      contenu: 'Regardez cet événement : ' + this.evenement.titre + ' qui se déroulera le ' + this.formatDateTime(this.evenement.dateDebut) + ' à ' + this.evenement.lieu,
      type: 'EVENEMENT',
      evenementId: this.evenementId
    };
    console.log("preloadedMessage", preloadedMessage);

    this.router.navigate(['/messaging'], {
      queryParams: {
        destinataireId: user,
        contenu: preloadedMessage.contenu,
        type: preloadedMessage.type,
        evenementId: preloadedMessage.evenementId
      }
    });
    this.showUsersModal = false;
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      this.showAuthRequiredModal = true;
      return false;
    }
    return true;
  }


  // Méthode pour ajouter une participation
  onParticipateToEvenement(evenement: any) {

    if (!this.checkAuthentication()) return;

    this.loading = true;
    this.error = '';
    this.evenementService.addParticipationToEvenement(evenement.id).subscribe({
      next: (res) => {
        this.isParticipating = true;
        this.participation = res.participation;
        this.loading = false;

        this.evenement= {
          ...this.evenement,
          placesRestantes: this.evenement.placesRestantes != null
            ? this.evenement.placesRestantes - 1
            : 0,
        }
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });

  }

  onUnsubscribeEvenement(evenement: Evenement) {

    if (!this.checkAuthentication()) return;

    this.loading = true;
    this.error = '';

    this.evenementService.removeParticipationFromEvenement(evenement.id).subscribe({
      next: () => {
        this.isParticipating = false;
        this.participation = null;
        this.loading = false;
        this.unsubscribeConfirmed = true;

        // Sauvegarder l'état de désinscription dans localStorage
        if (this.userId && this.evenement?.id) {
          const unsubscribeKey = `unsubscribed_${this.userId}_${this.evenement.id}`;
          localStorage.setItem(unsubscribeKey, 'true');
          this.userHasUnsubscribed = true;
        }

        // Vérifier si l'utilisateur peut maintenant demander un remboursement
        this.checkCanRequestRefund();

        // Cache la notif de désinscription après 3s
        setTimeout(() => {
          this.unsubscribeConfirmed = false;
        }, 3000);

        this.evenement = {
          ...this.evenement,
          placesRestantes: this.evenement.placesRestantes != null
            ? this.evenement.placesRestantes + 1
            : 0,
        }

      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  /**
   * Vérifier si l'utilisateur connecté a déjà liké cet événement
   */
  checkIfUserLiked() {
    if (this.userId && this.evenement?.likes) {
      this.userHasLiked = this.evenement.likes.some((like: any) => like.utilisateurId === this.userId);
      // Synchroniser avec l'ancienne propriété
      this.hasLikedEvenement = this.userHasLiked;
    }
  }

  /**
   * Vérifier si l'utilisateur connecté a déjà noté cet événement
   */
  checkIfUserHasRated() {
    if (this.userId && this.evenement?.ratings) {
      this.userHasRated = this.evenement.ratings.some((rating: any) => rating.utilisateur.id === this.userId);
      console.log('Vérification notation utilisateur:', {
        userId: this.userId,
        ratings: this.evenement.ratings,
        userHasRated: this.userHasRated
      });
    }
  }

  /**
   * Toggle le like sur l'événement (nouvelle méthode utilisant le backend)
   */
  toggleLike() {
    if (!this.checkAuthentication()) return;

    if (this.likesLoading) return;

    this.likesLoading = true;

    this.evenementService.likeEvenement(this.evenement.id).subscribe({
      next: (response) => {
        console.log('Like toggled successfully:', response);

        // Mettre à jour l'état local en fonction de l'action effectuée
        if (this.userHasLiked) {
          // L'utilisateur avait déjà liké, donc on retire le like
          this.nombreLikes = Math.max(0, this.nombreLikes - 1);
          this.userHasLiked = false;
          this.hasLikedEvenement = false;

          // Retirer le like de la liste locale
          if (this.evenement.likes) {
            this.evenement.likes = this.evenement.likes.filter((like: any) => like.utilisateurId !== this.userId);
          }
        } else {
          // L'utilisateur n'avait pas liké, donc on ajoute le like
          this.nombreLikes = this.nombreLikes + 1;
          this.userHasLiked = true;
          this.hasLikedEvenement = true;

          // Ajouter le like à la liste locale
          if (!this.evenement.likes) {
            this.evenement.likes = [];
          }
          this.evenement.likes.push({
            id: Date.now(), // ID temporaire
            utilisateurId: this.userId
          });
        }

        // Mettre à jour le nombreLikes dans l'objet evenement
        this.evenement.nombreLikes = this.nombreLikes;

        this.likesLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du toggle du like:', error);
        this.likesLoading = false;
      }
    });
  }

  onLikeEvenement(evenement: Evenement) {
    // Rediriger vers la nouvelle méthode
    this.toggleLike();
  }

  onAddComment(evenement: Evenement, commentText: string) {

    if (!this.checkAuthentication()) return;

    this.evenementService.addCommentToEvenement(evenement.id,commentText).subscribe({
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
      this.onAddComment(this.evenement, this.commentText);
      this.commentText = '';
    }
  }


  formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  isEventPassed(): boolean {
    if (!this.evenement || !this.evenement.dateFin) {
      return false;
    }
    const now = new Date();
    const eventEndDate = new Date(this.evenement.dateFin);
    return eventEndDate < now;
  }

  get eventImage(): string {
    if (Array.isArray(this.evenement?.images) && this.evenement.images.length > 0 && this.evenement.images[0]) {
      return this.evenement.images[0];
    }
    return 'assets/main-icon.jpg';
  }

  onPayWithHelloAsso() {
    // Vérifier l'authentification avant de procéder à l'achat
    if (!this.checkAuthentication()) return;

    this.errorPaymentMessage = '';
    const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
    if (
      utilisateur &&
      (utilisateur.id === this.evenement?.createur?.id ||
        utilisateur.email === this.evenement?.createur?.email)
    ) {
      this.errorPaymentMessage = "Le créateur de l'événement ne peut pas acheter de billet pour son propre événement.";
      return;
    }
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  shareOnCommunity() {
    if (!this.checkAuthentication()) return;

    this.showCommunityResearchPopup = true;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '17px'; // Pour éviter le décalage de la scrollbar
  }

  closeCommunityResearchPopup(communityID: number | null = null) {
    this.showCommunityResearchPopup = false;
    this.communityIDResearched = communityID;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  onCommunitySelected(communityId: number) {
    this.closeCommunityResearchPopup(communityId);
    console.log('Evenement:', this.evenement);
    this.router.navigate(
      ['/communities', communityId],
      {
        queryParams: {
          eventTitle: this.evenement.titre,
          eventDescription: this.evenement.description,
          link: window.location.href,
        }
      }
    );
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
    // Optionnel : rafraîchir les données de l'événement
    // this.evenementService.getEvenementById(this.evenementId).subscribe(...);
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
    this.canRequestRefund = hasUnsubscribed && this.evenement?.isPayant && !this.hasRequestedRefund;
  }

  /**
   * Vérifier si l'utilisateur a déjà demandé un remboursement pour cet événement
   */
  checkRefundRequestStatus(): void {
    if (this.userId && this.evenement?.id) {
      const refundKey = `refund_requested_${this.userId}_${this.evenement.id}`;
      this.hasRequestedRefund = localStorage.getItem(refundKey) === 'true';

      // Vérifier si l'utilisateur s'est désinscrit de cet événement
      const unsubscribeKey = `unsubscribed_${this.userId}_${this.evenement.id}`;
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
