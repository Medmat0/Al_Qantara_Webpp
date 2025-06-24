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
  tags: string[];  // On garde les tags pour la recherche
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

  constructor(
    private recruitmentService: RecruitmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.recruitmentService.getAllOffers().subscribe({
      next: (response: any) => {
        if (response && response.offres) {
          this.offers = response.offres.sort((a: any, b: any) =>
            a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' })
          );
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des offres:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredOffers = this.offers.filter(offer => {
      const searchTermLower = this.searchTerm.toLowerCase();
      return this.searchTerm === '' ||
        offer.titre.toLowerCase().includes(searchTermLower) ||
        offer.tags.some(tag => tag.toLowerCase().includes(searchTermLower));
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  viewOffer(offerId: number): void {
    // Redirection vers la page de détail de l'offre
    this.router.navigate(['/recruitment', offerId]);
  }
}
