import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AnnuaireService, Association } from '../../../../services/annuaire.service';

@Component({
  selector: 'app-admin-annuaire',
  templateUrl: './admin-annuaire.component.html',
  styleUrls: ['./admin-annuaire.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class AdminAnnuaireComponent implements OnInit {
  protected annuaireService = inject(AnnuaireService);

  // --- State ---
  associations: Association[] = [];
  filteredAssociations: Association[] = [];
  totalAssociations = 0;
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 12;
  isLoading = false;
  jumpToPage: number | null = null;
  searchTerm = '';
  selectedSecteur = '';
  activeCardMenu: number | null = null;
  showDeleteModal = false;
  associationToDelete: Association | null = null;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';
  Math = Math;

  ngOnInit(): void {
    this.loadAssociations();
  }

  loadAssociations(): void {
    this.isLoading = true;
    // Charger toutes les associations pour filtrage/pagination côté client
    this.annuaireService.getAllAssociationsAdmin({ page: 1, limite: 1000 }).subscribe({
      next: (response) => {
        this.associations = response.associations;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des associations';
        this.isLoading = false;
      }
    });
  }

  // --- Filtering & Search ---
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }
  filterBySecteur(secteur: string): void {
    this.selectedSecteur = secteur;
    this.currentPage = 1;
    this.applyFilters();
  }
  private applyFilters(): void {
    let filtered = [...this.associations];
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        (a.nom && a.nom.toLowerCase().includes(searchLower)) ||
        (a.description && a.description.toLowerCase().includes(searchLower)) ||
        (a.ville && a.ville.toLowerCase().includes(searchLower)) ||
        (a.region && a.region.toLowerCase().includes(searchLower))
      );
    }
    if (this.selectedSecteur) {
      filtered = filtered.filter(a => a.secteurActivite === this.selectedSecteur);
    }
    this.filteredAssociations = filtered;
    this.totalAssociations = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  }

  // Pour le HTML : unique secteurs (pour les filtres)
  get uniqueSecteurs(): string[] {
    return Array.from(new Set(this.associations.map(a => a.secteurActivite).filter((s): s is string => typeof s === 'string')));
  }

  // Gestion des images
  onImageError(event: any): void {
    event.target.src = 'assets/images/default-association-logo.png';
  }
  // Pagination côté client
  get associationsPage(): Association[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAssociations.slice(start, start + this.itemsPerPage);
  }

  // Classe CSS pour badge secteur
  getSecteurClass(secteur: string | undefined): string {
    if (!secteur) return 'secteur-autre';
    return `secteur-${secteur.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  // Badge "Nouveau" si créé il y a moins d'1 mois
  isRecentAssociation(association: Association): boolean {
    if (!association.dateCreation) return false;
    const creationDate = new Date(association.dateCreation);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return creationDate > oneMonthAgo;
  }

  // Liens sociaux présents ?
  hasSocialLinks(association: Association): boolean {
    return !!(association.siteWeb || association.facebook || association.instagram || association.linkedin);
  }

  // Menu actions sur carte
  toggleCardMenu(event: Event, index: number): void {
    event.stopPropagation();
    this.activeCardMenu = this.activeCardMenu === index ? null : index;
  }



  editAssociation(association: Association): void {
    // À implémenter : navigation ou modal édition
    console.log('Editer association:', association);
  }

  confirmDelete(association: Association): void {
    this.associationToDelete = association;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.associationToDelete = null;
    this.isDeleting = false;
  }

  async confirmDeleteAssociation(): Promise<void> {
    if (!this.associationToDelete?.id) return;
    this.isDeleting = true;
    try {
      const response = await this.annuaireService.supprimerAssociation(this.associationToDelete.id).toPromise();
      this.successMessage = response?.message || 'Association supprimée avec succès!';
      this.loadAssociations();
      this.cancelDelete();
      setTimeout(() => { this.successMessage = ''; }, 3000);
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Erreur lors de la suppression de l\'association';
      this.isDeleting = false;
    }
  }

  // Pagination moderne (HTML attend getVisiblePages, goToPage, currentPage, totalPages)
  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  }

  goToPage(page: number | null | string): void {
    // Si page est une string (ex: '...'), on ignore
    if (typeof page !== 'number' || isNaN(page) || page === null) return;
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
    }
  }

  // Pour trackBy dans *ngFor
  trackByAssociation(index: number, assoc: Association): number | undefined {
    return assoc.id;
  }

  // Format date pour le footer
  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }
}
