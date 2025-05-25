import {Component, inject, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {EventCalendarComponent} from '../event-calendar/event-calendar.component';
import {EventListingComponent} from '../event-listing/event-listing.component';
import {EventModalComponent} from '../event-modal/event-modal.component';
import {Evenement, LikeEvenement} from '../../../member/models/evenement';
import {EvenementService} from '../../../member/services/evenement.service';
import {AuthService} from '../../../member/services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-event-home',
  imports: [
    NgIf,
    EventCalendarComponent,
    EventListingComponent,
    EventModalComponent
  ],
  templateUrl: './event-home.component.html',
  standalone: true,
  styleUrl: './event-home.component.scss'
})
export class EventHomeComponent implements OnInit {
  isCalendarView = false;
  evenementService= inject(EvenementService);

  events:Evenement[]= [];

  authService = inject(AuthService);


  showModal = false;
  selectedEvent: any = null;
  selectedEventId: number | null = null;

  // propriétés pour la gestion visuelle de la modale
  loading = false;
  error = '';
  hasLikedEvenement = false;
  isParticipating = false;
  participation: any = null;
  unsubscribeConfirmed = false;
  isAuthenticated = false;

  userId: number | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }
      } else {
        this.userId = null;
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.selectedEventId = id ? +id : null;
      if (this.selectedEventId !== null) {
        // Cas /events/:id → fetch l’event par id
        this.evenementService.getEvenementById(this.selectedEventId).subscribe({
          next: (response) => {
            this.selectedEvent = response;
            this.showModal = true;
            this.unsubscribeConfirmed = false;
            this.onEvenementClick(this.selectedEvent);

          },
          error: (error) => {
            console.error('Erreur lors du fetch de l\'événement:', error);
          }
        });
      } else {
        // Cas /events → fetch tous les events
        this.fetchAllEvents();
      }
    });
  }

  fetchAllEvents() {
    this.evenementService.getAllEvenements().subscribe({
      next: (response) => {
        this.events = response;
      },
      error: (error) => {
        console.error('Erreur lors du fetch des événements:', error);
      }
    });
  }

  toggleView(view:boolean): void {
    this.isCalendarView = view;
  }



  //Code pour le getByID -------------------------------------------------------------

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      confirm('Vous devez être connecté pour interagir avec cet événement');
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedEvent = null;
    this.router.navigate(['events']);
  }

  onEvenementClick(evenement: Evenement) {
    if(!this.isAuthenticated) {

      return;
    }else{
      this.evenementService.checkParticipation(evenement.id).subscribe({
        next: (res) => {
          this.isParticipating = !!res.participation;
          this.participation = res.participation;
        },
        error: (err) => {
          this.error = err.message;
          console.error('Erreur lors de la vérification de la participation', err);
        }
      });

      // Vérifie si l'utilisateur a liké cet événement
      if (this.userId && Array.isArray(evenement.likes)) {
        this.hasLikedEvenement = evenement.likes.some(like => like.utilisateurId === this.userId);
      } else {
        this.hasLikedEvenement = false;
      }
      console.log("liked status: ", this.hasLikedEvenement);

    }
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


        // Met à jour l’événement sélectionné dans la modale
        if (this.selectedEvent && this.selectedEvent.id === evenement.id) {
          this.selectedEvent = {
            ...this.selectedEvent,
            placesRestantes: this.selectedEvent.placesRestantes - 1,
          };
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

        // Met à jour l’événement sélectionné dans la modale
        if (this.selectedEvent && this.selectedEvent.id === evenement.id) {
          this.selectedEvent = {
            ...this.selectedEvent,
            placesRestantes: this.selectedEvent.placesRestantes + 1,
          };
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

    if (!Array.isArray(evenement.likes)) {
      evenement.likes = [];
    }
    const likes = evenement.likes!;
    const idx = this.events.findIndex(e => e.id === evenement.id);

    if (!this.hasLikedEvenement) {
      // Ajoute un fake like localement
      const fakeLike: LikeEvenement = {
        id: (evenement.likes.length ? evenement.likes.length : 0) + 1,
        evenementId: evenement.id,
        utilisateurId: this.userId,
        dateLike: new Date().toString(),
      };
      evenement.likes = [...evenement.likes, fakeLike];
      if (idx !== -1) this.events[idx].likes = [...evenement.likes];
      if (this.selectedEvent && this.selectedEvent.id === evenement.id) {
        this.selectedEvent.likes = [...evenement.likes];
      }
      this.hasLikedEvenement = true;
    } else {
      // Retire le like localement
      evenement.likes = likes.filter(like => like.utilisateurId !== this.userId);
      if (idx !== -1) this.events[idx].likes = [...evenement.likes];
      if (this.selectedEvent && this.selectedEvent.id === evenement.id) {
        this.selectedEvent.likes = [...evenement.likes];
      }
      this.hasLikedEvenement = false;
    }

    // Appel API pour like/dislike
    this.evenementService.likeEvenement(evenement.id).subscribe({
      error: (err) => {
        if (this.hasLikedEvenement) {
          evenement.likes = likes.filter(like => like.utilisateurId !== this.userId);
          this.hasLikedEvenement = false;
        } else {
          const fakeLike: LikeEvenement = {
            id: (likes.length ? likes.length : 0) + 1,
            evenementId: evenement.id,
            utilisateurId: this.userId,
            dateLike: new Date().toString(),
          };
          evenement.likes = [...likes, fakeLike];
          this.hasLikedEvenement = true;
        }
        if (idx !== -1) this.events[idx].likes = [...evenement.likes];
        if (this.selectedEvent && this.selectedEvent.id === evenement.id) {
          this.selectedEvent.likes = [...evenement.likes];
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

}
