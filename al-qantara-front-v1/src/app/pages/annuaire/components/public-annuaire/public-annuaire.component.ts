import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AnnuaireService, Association, StatistiquesAnnuaire } from '../../../../services/annuaire.service';
import { DetailAnnuaireComponent } from '../detail-annuaire/detail-annuaire.component';

@Component({
  selector: 'app-public-annuaire',
  templateUrl: './public-annuaire.component.html',
  styleUrls: ['./public-annuaire.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DetailAnnuaireComponent]
})
export class PublicAnnuaireComponent implements OnInit {
  private annuaireService = inject(AnnuaireService);

  // --- State ---
  associations: Association[] = [];
  filteredAssociations: Association[] = [];
  statistiques: StatistiquesAnnuaire | null = null;
  secteurs: string[] = [];
  regions: string[] = [];
  isLoading = false;

  // Modal state
  selectedAssociation: Association | null = null;
  showModal = false;

  // Filtres
  searchTerm = '';
  selectedSecteur = '';
  selectedRegion = '';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 12;

  // UI
  viewMode: 'grid' | 'list' = 'grid';
  Math = Math;

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      // Charger toutes les données en parallèle
      const [associationsResponse, stats, secteurs, regions] = await Promise.all([
        this.annuaireService.getAssociations({ limite: 1000 }).toPromise(),
        this.annuaireService.getStatistiques().toPromise(),
        this.annuaireService.getSecteursActivite().toPromise(),
        this.annuaireService.getRegions().toPromise()
      ]);

      this.associations = associationsResponse?.associations || [];
      this.statistiques = stats || null;
      this.secteurs = secteurs || [];
      this.regions = regions || [];

      this.applyFilters();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // --- Filtrage et recherche ---
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

  filterByRegion(region: string): void {
    this.selectedRegion = region;
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSecteur = '';
    this.selectedRegion = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.associations];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        (a.nom && a.nom.toLowerCase().includes(searchLower)) ||
        (a.description && a.description.toLowerCase().includes(searchLower)) ||
        (a.ville && a.ville.toLowerCase().includes(searchLower))
      );
    }

    // Filtre par secteur
    if (this.selectedSecteur) {
      filtered = filtered.filter(a => a.secteurActivite === this.selectedSecteur);
    }

    // Filtre par région
    if (this.selectedRegion) {
      filtered = filtered.filter(a => a.region === this.selectedRegion);
    }

    this.filteredAssociations = filtered;
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  // --- Pagination ---
  get associationsPage(): Association[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAssociations.slice(start, start + this.itemsPerPage);
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1, '...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1, '...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  goToPage(page: number | null | string): void {
    if (typeof page !== 'number' || isNaN(page) || page === null) return;
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
    }
  }

  // --- Utilitaires ---
  getSecteurClass(secteur: string | undefined): string {
    if (!secteur) return 'secteur-autre';
    return 'secteur-' + secteur.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  formatWebsiteUrl(url: string | undefined): string {
    if (!url || url.trim() === '') return '';

    const trimmedUrl = url.trim();

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    return `http://${trimmedUrl}`;
  }

  hasSocialLinks(association: Association): boolean {
    return !!(association.siteWeb || association.facebook || association.instagram || association.linkedin);
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  trackByAssociation(index: number, assoc: Association): number | undefined {
    return assoc.id;
  }

  getAssociationLogo(association: Association): string {
    // Vérifier si le logo existe et n'est pas une URL blob invalide
    if (association.logo &&
        association.logo.trim() !== '' &&
        !association.logo.startsWith('blob:') &&
        association.logo !== 'null' &&
        association.logo !== 'undefined') {
      return association.logo;
    }
    return '/assets/asso_default.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/asso_default.png';
    }
  }

  onImageLoad(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.opacity = '1';
    }
  }

  // --- Actions ---
  viewDetails(association: Association): void {
    // Récupérer les détails complets via l'API
    this.annuaireService.getAssociation(association.id).subscribe({
      next: (detailsAssociation) => {
        this.selectedAssociation = detailsAssociation;
        this.showModal = true;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des détails:', error);
        // Fallback : utiliser les données existantes
        this.selectedAssociation = association;
        this.showModal = true;
      }
    });
  }

  onCloseModal(): void {
    this.showModal = false;
    this.selectedAssociation = null;
  }

  visitWebsite(url: string): void {
    window.open(url, '_blank');
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  // --- Getters pour les stats ---
  get totalAssociations(): number {
    return this.statistiques?.total || this.associations.length;
  }

  get associationsActives(): number {
    return this.statistiques?.total || this.associations.length;
  }

  get nombreSecteurs(): number {
    return this.secteurs.length;
  }

  get nombreRegions(): number {
    return this.regions.length;
  }

  get evolutionMensuelle(): number {
    // Calcul basé sur les données disponibles ou valeur par défaut
    return 5; // Pourcentage d'évolution fictif
  }

  // --- Filtres disponibles ---
  get uniqueSecteurs(): string[] {
    return Array.from(new Set(this.associations.map(a => a.secteurActivite).filter((s): s is string => typeof s === 'string')));
  }

  get uniqueRegions(): string[] {
    return Array.from(new Set(this.associations.map(a => a.region).filter((r): r is string => typeof r === 'string')));
  }
}
