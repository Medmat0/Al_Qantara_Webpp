import {Component, inject} from '@angular/core';
import { EventItemComponent } from './event-item/event-item.component';
import {NgForOf, NgIf} from '@angular/common';
import {EventDescriptionComponent} from '../event-description/event-description.component';
import {EvenementService} from '../../../member/services/evenement.service';
import { Router } from '@angular/router';
import {Evenement} from '../../../member/models/evenement';
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
  isParticipating = false;
  participation: any = null;
  unsubscribeConfirmed = false;


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



  onEvenementClick(Evenement: Evenement) {
    this.evenementService.checkParticipation(Evenement.id).subscribe({
      next: (res) => {
        if(res.participation === null) {
          this.isParticipating = false;
        }
        else {
          this.isParticipating = true;
          this.participation = res.participation;
        }
      },
      error: (err) => {
        this.error = err.message;
        console.error('Erreur lors de la vérification de la participation', err);
      }
    });
  }

  // Méthode pour ajouter une participation
  onParticipateToEvenement(Evenement: any) {
    this.loading = true;
    this.error = '';
    this.evenementService.addParticipationToEvenement(Evenement.id).subscribe({
      next: (res) => {
        this.isParticipating = true;
        this.participation = res.participation;
        this.loading = false;

        // Met à jour l’événement dans la liste
        const idx = this.events.findIndex(e => e.id === Evenement.id);
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
        if (this.selectedEvent && this.selectedEvent.id === Evenement.id) {
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

  onUnsubscribeEvenement(Evenement: Evenement) {
    this.loading = true;
    this.error = '';

    this.evenementService.removeParticipationFromEvenement(Evenement.id).subscribe({
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
        const idx = this.events.findIndex(e => e.id === Evenement.id);
        if (idx !== -1) {
          this.events[idx] = {
            ...this.events[idx],
            placesRestantes: this.events[idx].placesRestantes != null
              ? this.events[idx].placesRestantes + 1
              : 0,
          };
        }

        // Met à jour l’événement sélectionné dans la modale
        if (this.selectedEvent && this.selectedEvent.id === Evenement.id) {
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

  onLikeEvenement(Evenement: Evenement) {
    this.evenementService.likeEvenement(Evenement.id).subscribe({
      next: (res) => {
        // Met à jour dans la liste
        const idx = this.events.findIndex(e => e.id === Evenement.id);
        if (idx !== -1) {
          this.events[idx] = {
            ...this.events[idx],
            likes: Array.isArray(this.events[idx].likes)
              ? [...this.events[idx].likes, {} as any]
              : [{} as any]
          };
        }
        // Met à jour dans la modale si besoin
        if (this.selectedEvent && this.selectedEvent.id === Evenement.id) {
          this.selectedEvent = {
            ...this.selectedEvent,
            likes: Array.isArray(this.selectedEvent.likes)
              ? [...this.selectedEvent.likes, {} as any]
              : [{} as any]
          };
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du like', err);
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
