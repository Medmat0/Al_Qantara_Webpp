import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventItemComponent } from '../../../events/event-listing/event-item/event-item.component';
import { Evenement } from '../../../../member/models/evenement';
import { AdminEvenementService } from '../../../../admin/services/admin-evenement.service';
import { EvenementService } from '../../../../member/services/evenement.service';

@Component({
  selector: 'app-evenements-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, EventItemComponent],
  templateUrl: './evenements.component.html',
  styleUrls: ['./evenements.component.scss']
})
export class EvenementsComponent {
  evenementService = inject(EvenementService);
  adminEvenementService = inject(AdminEvenementService);
  router = inject(Router);

  events: Evenement[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  deletingEventId: number | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  
  // Filter
  selectedFilter = 'none';

  // Modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  eventToDelete: Evenement | null = null;

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.error = '';

    this.evenementService.getAllEvenements().subscribe({
      next: (response) => {
        this.events = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des événements:', error);
        this.error = 'Une erreur est survenue lors du chargement des événements.';
        this.loading = false;
      }
    });
  }

  async onDeleteEvent(event: Evenement): Promise<void> {
    this.eventToDelete = event;
    this.modalTitle = 'Confirmation de suppression';
    this.modalMessage = `Êtes-vous sûr de vouloir supprimer l'événement "${event.titre}" ?`;
    this.showModal = true;
  }

  confirmModal(): void {
    if (this.eventToDelete) {
      this.deletingEventId = this.eventToDelete.id;
      
      this.adminEvenementService.deleteEvenement(this.eventToDelete.id).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== this.eventToDelete?.id);
          this.deletingEventId = null;
          this.closeModal();
          
          // Reload current page if it's empty
          if (this.filteredEvents.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Une erreur est survenue lors de la suppression de l\'événement.');
          this.deletingEventId = null;
          this.closeModal();
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.eventToDelete = null;
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.currentPage = 1; // Reset to first page when filter changes
  }

  get filteredEvents() {
    // First apply search filter
    let filtered = this.events;
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.titre.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.lieu.toLowerCase().includes(searchLower)
      );
    }

    // Then apply sort filter
    if (this.selectedFilter !== 'none') {
      filtered = [...filtered]; // Create new array to avoid mutating original
      filtered.sort((a, b) => {
        const dateA = new Date(a.dateDebut).getTime();
        const dateB = new Date(b.dateDebut).getTime();
        return this.selectedFilter === 'most-recent' ? dateB - dateA : dateA - dateB;
      });
    }

    // Finally apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    const filteredCount = this.events.filter(event => {
      if (!this.searchTerm) return true;
      const searchLower = this.searchTerm.toLowerCase();
      return event.titre.toLowerCase().includes(searchLower) ||
             event.description.toLowerCase().includes(searchLower) ||
             event.lieu.toLowerCase().includes(searchLower);
    }).length;
    return Math.ceil(filteredCount / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
