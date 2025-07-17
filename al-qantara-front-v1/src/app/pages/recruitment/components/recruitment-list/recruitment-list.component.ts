import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruitmentService } from '../../../admin/services/recruitment.service';
import { Router } from '@angular/router';

interface Offer {
  id: number;
  titre: string;
  description: string;
  lieuDeTravail: string;
  typeDeContrat: string;
  dateDebut: string;
  tags: string[];
  competences: string[]; // Rendu obligatoire avec valeur par défaut
  salaire?: string; // Optionnel
}

@Component({
  selector: 'app-recruitment-list',
  templateUrl: './recruitment-list.component.html',
  styleUrls: ['./recruitment-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RecruitmentListComponent implements OnInit {
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  searchTerm: string = '';
  selectedContractType: string = 'all';
  isLoading: boolean = false;

  // Types de contrat disponibles
  contractTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Stage', label: 'Stage' },
    { value: 'Freelance', label: 'Freelance' },
    { value: 'BENEVOLAT', label: 'Bénévolat' }
  ];

  constructor(
    private recruitmentService: RecruitmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;
    this.recruitmentService.getAllOffers().subscribe({
      next: (response: any) => {
        if (response && response.offres) {
          this.offers = response.offres
            .map((offer: any) => ({
              ...offer,
              // Assure-toi que les compétences sont bien mappées
              competences: offer.competences || offer.tags || [],
              // Mapping du salaire si disponible
              salaire: offer.salaire || offer.remuneration || null
            }))
            .sort((a: any, b: any) =>
              a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' })
            );
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des offres:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredOffers = this.offers.filter(offer => {
      // Filtre par terme de recherche
      const matchesSearch = this.matchesSearchTerm(offer);
      
      // Filtre par type de contrat
      const matchesContract = this.selectedContractType === 'all' || 
                             offer.typeDeContrat === this.selectedContractType;

      return matchesSearch && matchesContract;
    });
  }

  private matchesSearchTerm(offer: Offer): boolean {
    if (!this.searchTerm) return true;
    
    const searchTermLower = this.searchTerm.toLowerCase();
    const searchableFields = [
      offer.titre,
      offer.description,
      offer.lieuDeTravail,
      offer.typeDeContrat,
      ...(offer.tags || []),
      ...(offer.competences || [])
    ];

    return searchableFields.some(field => 
      field?.toLowerCase().includes(searchTermLower)
    );
  }

  onSearchChange(): void {
    // Petite temporisation pour éviter trop d'appels
    setTimeout(() => {
      this.applyFilters();
    }, 100);
  }

  filterByContract(contractType: string): void {
    this.selectedContractType = contractType;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedContractType = 'all';
    this.applyFilters();
  }

  viewOffer(offerId: number): void {
    // Redirection vers la page de détail de l'offre
    this.router.navigate(['/recruitment', offerId]);
  }

  // Fonction pour optimiser le rendu des listes
  trackByOfferId(index: number, offer: Offer): number {
    return offer.id;
  }

  // Fonction utilitaire pour formater la date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Fonction pour obtenir la couleur du badge selon le type de contrat
  getBadgeClass(contractType: string): string {
    const badgeClasses: { [key: string]: string } = {
      'CDI': 'badge-cdi',
      'CDD': 'badge-cdd',
      'Stage': 'badge-stage',
      'Freelance': 'badge-freelance'
    };
    return badgeClasses[contractType] || 'badge-default';
  }

  // Fonction pour obtenir un extrait de la description
  getDescriptionExcerpt(description: string, maxLength: number = 120): string {
    if (!description || description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength).trim() + '...';
  }

  // Fonction pour vérifier si un filtre est actif
  isFilterActive(contractType: string): boolean {
    return this.selectedContractType === contractType;
  }

  // Fonction pour obtenir le nombre total d'offres
  getTotalOffersCount(): number {
    return this.offers.length;
  }

  // Fonction pour obtenir le texte du compteur de résultats
  getResultsText(): string {
    const count = this.filteredOffers.length;
    if (count === 0) return 'Aucune offre trouvée';
    if (count === 1) return '1 offre trouvée';
    return `${count} offres trouvées`;
  }
}