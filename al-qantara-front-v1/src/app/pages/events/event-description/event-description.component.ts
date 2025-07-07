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

@Component({
  selector: 'app-event-description',
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    NgClass,
    DatePipe,
    UsersListComponent
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


  // propriétés pour la gestion visuelle de la description
  loading = false;
  error = '';
  hasLikedEvenement = false;
  isParticipating = false;
  participation: any = null;
  unsubscribeConfirmed: boolean = false;
  errorPaymentMessage = '';
  showPaymentModal = false;

  constructor(private route: ActivatedRoute, private router: Router, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {
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
    alert('Lien copié !');
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

  shareOnInstagram() {
    alert('Le partage direct sur Instagram n\'est pas supporté depuis le web.');
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
      confirm('Vous devez être connecté pour interagir avec cet événement');
      this.router.navigate(['auth/login']);
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

  onLikeEvenement(evenement: Evenement) {
    if (!this.checkAuthentication()) return;

    // Toujours garantir que c'est un tableau
    if (!Array.isArray(evenement.likes)) {
      evenement.likes = [];
    }

    const userLikeIndex = evenement.likes.findIndex((like: LikeEvenement) => like.utilisateurId === this.userId);

    if (userLikeIndex === -1) {
      // Ajoute un like localement
      const fakeLike: LikeEvenement = {
        id: evenement.likes.length + 1,
        evenementId: evenement.id,
        utilisateurId: this.userId,
        dateLike: new Date().toString(),
      };
      evenement.likes = [...evenement.likes, fakeLike];
      this.hasLikedEvenement = true;
    } else {
      // Retire le like localement
      evenement.likes = evenement.likes.filter((like: LikeEvenement) => like.utilisateurId !== this.userId);
      this.hasLikedEvenement = false;
    }

    this.evenementService.likeEvenement(evenement.id).subscribe({
      error: (err) => {
        if (!Array.isArray(evenement.likes)) {
          evenement.likes = [];
        }
        if (this.hasLikedEvenement) {
          evenement.likes = evenement.likes.filter((like: LikeEvenement) => like.utilisateurId !== this.userId);
          this.hasLikedEvenement = false;
        } else {
          const fakeLike: LikeEvenement = {
            id: evenement.likes.length + 1,
            evenementId: evenement.id,
            utilisateurId: this.userId,
            dateLike: new Date().toString(),
          };
          evenement.likes = [...evenement.likes, fakeLike];
          this.hasLikedEvenement = true;
        }
        console.error('Erreur lors du like/delike', err);
      }
    });
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

  handleShare() {
    /*
    const subject = `Invitation à l'événement: ${this.evenement.titre}`;
    const body = `Bonjour,\n\nJe vous invite à l'événement "${this.evenement.titre}" qui se déroulera le ${this.formatDateTime(this.evenement.dateDebut)} à ${this.evenement.lieu}.\n\nPour plus d'informations, visitez notre site web.\n\nCordialement`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

     */
  }

  get eventImage(): string {
    if (Array.isArray(this.evenement?.images) && this.evenement.images.length > 0 && this.evenement.images[0]) {
      return this.evenement.images[0];
    }
    return 'assets/main-icon.jpg';
  }

  onPayWithHelloAsso() {
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

}
