import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { AuthService } from '../../../member/services/auth.service';
import { EvenementService } from '../../../member/services/evenement.service';
import { Router } from '@angular/router';

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
    PaymentModalComponent

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

  safeMapUrl: SafeResourceUrl | null = null;
  commentText = '';
  showCommentForm = false;
  showComments = false;

  showPaymentModal = false;
  errorMessage = '';
  loadingPayment = false;
  errorPaymentMessage = '';

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
  }

  copyLink() {
    const url = `/events/${this.event?.id}`;
    navigator.clipboard.writeText(url);
    this.showShareMenu = false;
    alert('Lien copié !');
  }

  shareByMessage() {
    this.shareByMessageEvent.emit(this.event);
    this.showShareMenu = false;
  }


  shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    this.showShareMenu = false;
  }

  shareOnInstagram() {
    alert('Le partage direct sur Instagram n\'est pas supporté depuis le web.');
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
      confirm('Vous devez être connecté pour interagir avec cet événement');
      this.router.navigate(['auth/login']);
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

}
