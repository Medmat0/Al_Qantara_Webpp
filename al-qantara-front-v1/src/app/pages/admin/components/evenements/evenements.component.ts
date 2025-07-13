// --- Gestion des remboursements ---

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventItemComponent } from '../../../events/event-listing/event-item/event-item.component';
import { Evenement } from '../../../../member/models/evenement';
import { AdminEvenementService } from '../../../../admin/services/admin-evenement.service';
import { EvenementService } from '../../../../member/services/evenement.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Participant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photoProfil?: string;
}

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

  currentPage = 1;
  itemsPerPage = 8;

  selectedFilter = 'none';

  showModal = false;
  modalTitle = '';
  modalMessage = '';
  eventToDelete: Evenement | null = null;

  showParticipantsModal = false;
  participants: Participant[] = [];
  loadingParticipants = false;
  selectedEventTitle = '';

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

   remboursements: any[] = [];
  showRemboursementsModal = false;
  loadingRemboursements = false;
  actionLoadingId: number | null = null;
  isRibVisible: { [key: number]: boolean } = {}; // Pour gérer la visibilité du RIB

  onShowRemboursements(eventId: number): void {
    const event = this.events.find((e: any) => e.id === eventId);
    if (!event) { return; }
    this.selectedEventTitle = event.titre;
    this.showRemboursementsModal = true;
    this.loadRemboursements(eventId);
  }

  loadRemboursements(eventId: number): void {
    this.loadingRemboursements = true;
    this.remboursements = [];
    this.isRibVisible = {}; // Reset visibility state
    this.adminEvenementService.getRemboursementsByEvent(eventId).subscribe({
      next: (data: any[]) => {
        this.remboursements = data;
        // Initialiser l'état de visibilité du RIB (masqué par défaut)
        data.forEach(demande => {
          this.isRibVisible[demande.id] = false;
        });
        this.loadingRemboursements = false;
      },
      error: () => {
        this.loadingRemboursements = false;
      }
    });
  }

  updateRemboursementStatus(demandeId: number, status: 'accepte' | 'refuse'): void {
    this.actionLoadingId = demandeId;
    this.adminEvenementService.updateRemboursementStatus(demandeId, status).subscribe({
      next: () => {
        const idx = this.remboursements.findIndex((d: any) => d.id === demandeId);
        if (idx > -1) this.remboursements[idx].status = status;
        this.actionLoadingId = null;
      },
      error: () => {
        this.actionLoadingId = null;
      }
    });
  }

  closeRemboursementsModal(): void {
    this.showRemboursementsModal = false;
    this.remboursements = [];
    this.selectedEventTitle = '';
    this.isRibVisible = {}; // Reset visibility state
  }

  onEditEvent(event: Evenement): void {
    // Pour l'instant, on peut rediriger vers une page d'édition ou ouvrir un modal
    // Exemple de redirection vers une page d'édition :
    this.router.navigate(['/admin/evenements/edit', event.id]);

    // Ou si vous préférez afficher une alerte temporaire :
    // alert(`Édition de l'événement: ${event.titre}`);
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
    let filtered = this.events;
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.titre.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.lieu.toLowerCase().includes(searchLower)
      );
    }

    if (this.selectedFilter !== 'none') {
      filtered = [...filtered];
      filtered.sort((a, b) => {
        const dateA = new Date(a.dateDebut).getTime();
        const dateB = new Date(b.dateDebut).getTime();
        return this.selectedFilter === 'most-recent' ? dateB - dateA : dateA - dateB;
      });
    }

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

  onShowParticipants(eventId: number): void {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    this.selectedEventTitle = event.titre;
    this.showParticipantsModal = true;
    this.loadParticipants(eventId);
  }

  loadParticipants(eventId: number): void {
    this.loadingParticipants = true;
    this.participants = [];

    this.evenementService.getEvenementById(eventId).subscribe({
      next: (response) => {
        if (response && response.participations) {
          this.participants = response.participations.map((participation: any) => ({
            id: participation.utilisateur.id,
            nom: participation.utilisateur.nom,
            prenom: participation.utilisateur.prenom,
            email: participation.utilisateur.email,
            telephone: participation.utilisateur.telephone || 'Non renseigné',
            photoProfil: participation.utilisateur.photoProfil
          }));
        }
        this.loadingParticipants = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des participants:', error);
        this.loadingParticipants = false;
      }
    });
  }

  closeParticipantsModal(): void {
    this.showParticipantsModal = false;
    this.participants = [];
    this.selectedEventTitle = '';
  }

  exportToPDF(): void {
    if (this.participants.length === 0) {
      alert('Aucun participant à exporter.');
      return;
    }

    const doc = new jsPDF();
    const fileName = `${this.sanitizeFileName(this.selectedEventTitle)}_participants.pdf`;

    doc.setFontSize(18);
    doc.setTextColor(158, 46, 44);
    doc.text(`Liste des participants`, 14, 22);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Événement: ${this.selectedEventTitle}`, 14, 35);

    doc.setFontSize(10);
    doc.text(`Nombre de participants: ${this.participants.length}`, 14, 52);
    const tableData = this.participants.map(participant => [
      participant.nom,
      participant.prenom,
      participant.email,
      participant.telephone
    ]);

    autoTable(doc, {
      head: [['Nom', 'Prénom', 'Email', 'Téléphone']],
      body: tableData,
      startY: 60,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [158, 46, 44],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { top: 60, left: 14, right: 14 }
    });
    doc.save(fileName);
  }

  exportToCSV(): void {
    if (this.participants.length === 0) {
      alert('Aucun participant à exporter.');
      return;
    }

    const fileName = `${this.sanitizeFileName(this.selectedEventTitle)}_participants.csv`;
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone'];
    const csvData = this.participants.map(participant => [
      participant.nom,
      participant.prenom,
      participant.email,
      participant.telephone
    ]);

    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => row.map(field => `"${field}"`).join(';'))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportRemboursementsToPDF(): void {
    if (this.remboursements.length === 0) {
      alert('Aucune demande de remboursement à exporter.');
      return;
    }

    const doc = new jsPDF();
    const fileName = `${this.sanitizeFileName(this.selectedEventTitle)}_remboursements.pdf`;

    doc.setFontSize(18);
    doc.setTextColor(158, 46, 44);
    doc.text(`Demandes de remboursement`, 14, 22);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Événement: ${this.selectedEventTitle}`, 14, 35);

    doc.setFontSize(10);
    doc.text(`Nombre de demandes: ${this.remboursements.length}`, 14, 52);

    const tableData = this.remboursements.map(demande => [
      `${demande.utilisateur.nom} ${demande.utilisateur.prenom}`,
      demande.utilisateur.email,
      demande.raison || 'Non précisé',
      demande.rib || 'Non fourni', // Toujours exporter le RIB complet
      this.getStatusLabel(demande.status),
      new Date(demande.dateDemande).toLocaleDateString('fr-FR')
    ]);

    autoTable(doc, {
      head: [['Nom', 'Email', 'Motif', 'RIB', 'Statut', 'Date demande']],
      body: tableData,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [158, 46, 44],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        3: { cellWidth: 30 }, // RIB column
        4: { cellWidth: 20 }, // Statut column
        5: { cellWidth: 25 }  // Date column
      },
      margin: { top: 60, left: 14, right: 14 }
    });

    doc.save(fileName);
  }

  exportRemboursementsToCSV(): void {
    if (this.remboursements.length === 0) {
      alert('Aucune demande de remboursement à exporter.');
      return;
    }

    const fileName = `${this.sanitizeFileName(this.selectedEventTitle)}_remboursements.csv`;
    const headers = ['Nom', 'Prénom', 'Email', 'Motif', 'RIB', 'Statut', 'Date demande'];
    const csvData = this.remboursements.map(demande => [
      demande.utilisateur.nom,
      demande.utilisateur.prenom,
      demande.utilisateur.email,
      demande.raison || 'Non précisé',
      demande.rib || 'Non fourni', // Toujours exporter le RIB complet
      this.getStatusLabel(demande.status),
      new Date(demande.dateDemande).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => row.map(field => `"${field}"`).join(';'))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ\s-_]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'accepte':
        return 'Accepté';
      case 'refuse':
        return 'Refusé';
      default:
        return status;
    }
  }

  toggleRibVisibility(demandeId: number): void {
    this.isRibVisible[demandeId] = !this.isRibVisible[demandeId];
  }
}
