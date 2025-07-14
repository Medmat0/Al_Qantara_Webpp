import {Component, inject, Input} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EventItemComponent } from './event-item/event-item.component';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {EventModalComponent} from '../event-modal/event-modal.component';
import {EvenementService} from '../../../member/services/evenement.service';
import { Router } from '@angular/router';
import {Evenement, LikeEvenement} from '../../../member/models/evenement';
import {AuthService} from '../../../member/services/auth.service';
import {UsersListComponent} from '../../messaging/components/users-list/users-list.component';
import {MessagerieService} from '../../../member/services/messagerie.service';
import { AuthRequiredModalComponent } from '../../auth-required-modal/auth-required-modal.component';

@Component({
  selector: 'app-event-listing',
  imports: [
    EventItemComponent,
    NgForOf,
    EventModalComponent,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    FormsModule,
    UsersListComponent,
    AuthRequiredModalComponent

  ],
  templateUrl: './event-listing.component.html',
  standalone: true,
  styleUrl: './event-listing.component.scss'
})
export class EventListingComponent {
  @Input() events: Evenement[] = [];

  evenementService = inject(EvenementService);
  authService = inject(AuthService);
  router = inject(Router);
  messagerieService = inject(MessagerieService);

  // Search and filter properties
  searchTerm: string = '';
  selectedFilter: string = 'none';
  selectedStatusFilter: string = 'upcoming'; // Par défaut : à venir

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 6;

  // Modal properties
  showModal = false;
  selectedEvent: any = null;

  // Modal state properties
  loading = false;
  error = '';
  hasLikedEvenement = false;
  isParticipating = false;
  participation: any = null;
  unsubscribeConfirmed = false;
  isAuthenticated = false;

  users: any[] = []; // Liste des utilisateurs pour la modal de partage
  showUsersModal = false; // Contrôle l'affichage de la modal de partage
  eventToShare: any = null;
  showAuthModal = false; // Modal d'authentification

  userId: number | null = null;
  constructor() {
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

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      this.showAuthModal = true;
      return false;
    }
    return true;
  }

  onAuthModalClose() {
    this.showAuthModal = false;
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

        // Met à jour l'événement dans la liste
        const idx = this.events.findIndex(e => e.id === evenement.id);
        if (idx !== -1) {
          this.events[idx] = {
            ...this.events[idx],
            placesRestantes: this.events[idx].placesRestantes != null
              ? this.events[idx].placesRestantes - 1
              : 0,
            // Ajout d'autres propriétés si besoin
          };
        }

        // Met à jour l'événement sélectionné dans la modale
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

        // Met à jour l'événement dans la liste
        const idx = this.events.findIndex(e => e.id === evenement.id);
        if (idx !== -1) {
          this.events[idx] = {
            ...this.events[idx],
            placesRestantes: this.events[idx].placesRestantes != null
              ? this.events[idx].placesRestantes + 1
              : 0,
          };
        }

        // Met à jour l'événement sélectionné dans la modale
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




  get displayedEvents() {
    let filtered = this.events;

    // Filtre de recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.titre.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.lieu.toLowerCase().includes(searchLower)
      );
    }

    // Filtre de statut
    const now = this.now;
    switch (this.selectedStatusFilter) {
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.dateDebut) > now);
        break;
      case 'happening':
        filtered = filtered.filter(event =>
          new Date(event.dateDebut) <= now && new Date(event.dateFin) >= now
        );
        break;
      case 'past':
        filtered = filtered.filter(event => new Date(event.dateFin) < now);
        break;
    }

    // Filtre de tri
    switch (this.selectedFilter) {
      case 'most-recent':
        filtered = [...filtered].sort((a, b) =>
          new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
        );
        break;
      case 'most-old':
        filtered = [...filtered].sort((a, b) =>
          new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
        );
        break;
      case 'most-popular':
        filtered = [...filtered].sort((a, b) =>
          (b.likes?.length || 0) - (a.likes?.length || 0)
        );
        break;
    }

    // Pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    let filtered = this.events;

    // Appliquer les mêmes filtres pour calculer le nombre total de pages
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.titre.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.lieu.toLowerCase().includes(searchLower)
      );
    }

    const now = this.now;
    switch (this.selectedStatusFilter) {
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.dateDebut) > now);
        break;
      case 'happening':
        filtered = filtered.filter(event =>
          new Date(event.dateDebut) <= now && new Date(event.dateFin) >= now
        );
        break;
      case 'past':
        filtered = filtered.filter(event => new Date(event.dateFin) < now);
        break;
    }

    return Math.ceil(filtered.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
  }

  onStatusFilterChange(statusFilter: string): void {
    this.selectedStatusFilter = statusFilter;
    this.currentPage = 1;
  }

  get now(): Date {
    return new Date();
  }

  getEventStatus(event: Evenement): string {
    const now = this.now;
    const eventStart = new Date(event.dateDebut);
    const eventEnd = new Date(event.dateFin);

    if (eventStart > now) {
      return 'upcoming';
    } else if (eventStart <= now && eventEnd >= now) {
      return 'happening';
    } else {
      return 'past';
    }
  }

  openUsersModal() {
    this.messagerieService.getAllUsers().subscribe({
      next: res => {
        this.users = res.data;
        this.showUsersModal = true;
      }
    });
  }

  formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  onShareByMessage(user: any) {
    if (!this.checkAuthentication()) return;
    if (!this.eventToShare) return;

    this.router.navigate(['/messaging'], {
      queryParams: {
        destinataireId: user,
        contenu: `Regardez cet événement : ${this.eventToShare.titre} qui se déroulera le ${this.formatDateTime(this.eventToShare.dateDebut)} à ${this.eventToShare.lieu}`,
        type: 'EVENEMENT',
        evenementId: this.eventToShare.id
      }
    });
    this.showModal = false;
    this.showUsersModal = false;
    this.eventToShare = null;
  }

  onShareByMessageFromModal(event: any) {
    this.eventToShare = event;
    this.messagerieService.getAllUsers().subscribe({
      next: res => {
        this.users = res.data;
        this.showUsersModal = true;
      }
    });
  }




}
