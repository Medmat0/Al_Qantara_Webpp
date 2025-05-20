import {Component, inject} from '@angular/core';
import { EventItemComponent } from './event-item/event-item.component';
import {NgForOf, NgIf} from '@angular/common';
import {EventDescriptionComponent} from '../event-description/event-description.component';
import {EvenementService} from '../../../member/services/evenement.service';
import { Router } from '@angular/router';
import {Evenement, LikeEvenement} from '../../../member/models/evenement';
@Component({
  selector: 'app-event-listing',
  imports: [
    EventItemComponent,
    NgForOf,
    EventDescriptionComponent,
    NgIf
  ],
  templateUrl: './event-listing.component.html',
  standalone: true,
  styleUrl: './event-listing.component.scss'
})
export class EventListingComponent {
  evenementService = inject(EvenementService);
  router = inject(Router);

  events:Evenement[] = [];

  showModal = false;
  selectedEvent: any = null;
  // propriétés pour la gestion de la participation
  loading = false;
  error = '';
  hasLikedEvenement = false;
  isParticipating = false;
  participation: any = null;
  unsubscribeConfirmed = false;


  userId: number | null = null;
  constructor() {
    const user = localStorage.getItem('utilisateur');
    if (user) {
      try {
        this.userId = JSON.parse(user).id;
      } catch {
        this.userId = null;
      }
    }
  }

  openModal(event: any) {
    this.selectedEvent = event;
    this.showModal = true;
    this.unsubscribeConfirmed = false;
    this.onEvenementClick(event);
  }
  closeModal() {
    this.showModal = false;
    this.selectedEvent = null;
  }

  ngOnInit() {
    this.evenementService.getAllEvenements().subscribe({
      next: (response) => {
        this.events = response;
        console.log('Liste des événements récupérée avec succès', response);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des événements', error);
      }
    });

    // Récupère l'id depuis le state de l'historique
    const openEventId = history.state?.openEventId;
    if (openEventId) {
      const event = this.events.find(e => e.id === openEventId);
      if (event) {
        this.openModal(event);
      }
    }
  }



  onEvenementClick(evenement: Evenement) {
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

  // Méthode pour ajouter une participation
  onParticipateToEvenement(evenement: any) {
    this.loading = true;
    this.error = '';
    this.evenementService.addParticipationToEvenement(evenement.id).subscribe({
      next: (res) => {
        this.isParticipating = true;
        this.participation = res.participation;
        this.loading = false;

        // Met à jour l’événement dans la liste
        const idx = this.events.findIndex(e => e.id === evenement.id);
        if (idx !== -1) {
          this.events[idx] = {
            ...this.events[idx],
            placesRestantes: this.events[idx].placesRestantes != null
              ? this.events[idx].placesRestantes - 1
              : 0,
            // Ajout d’autres propriétés si besoin
          };
        }

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

        // Met à jour l’événement dans la liste
        const idx = this.events.findIndex(e => e.id === evenement.id);
        if (idx !== -1) {
          this.events[idx] = {
            ...this.events[idx],
            placesRestantes: this.events[idx].placesRestantes != null
              ? this.events[idx].placesRestantes + 1
              : 0,
          };
        }

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




  // Pagination-----------------
  currentPage: number = 1;
  itemsPerPage: number = 6;

  get filteredEvenements() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.events.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
