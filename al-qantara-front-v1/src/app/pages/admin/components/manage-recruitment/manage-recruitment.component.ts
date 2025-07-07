
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruitmentService } from '../../services/recruitment.service';
import { Router } from '@angular/router';
import { EditRecruitmentComponent } from '../edit-recruitment/edit-recruitment.component';
import { ApplicantListComponent } from '../applicant-list/applicant-list.component';

interface Offer {
  id: number;
  titre: string;
  description: string;
  lieuDeTravail: string;
  typeDeContrat: string;
  dateDebut: string;
  datePublication: string;
  tags: string[];
  createdBy: number;
}

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-recruitment',
  templateUrl: './manage-recruitment.component.html',
  styleUrls: ['./manage-recruitment.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, EditRecruitmentComponent, ApplicantListComponent]
})
export class ManageRecruitmentComponent implements OnInit {
  public offers: Offer[] = [];
  public filteredOffers: Offer[] = [];
  public searchTerm: string = '';
  public selectedContract: string = '';
  public selectedOfferId: number | null = null;

  // Variables pour la modale des candidats
  public applicantsOfferId: number | null = null;
  public showApplicantsModal: boolean = false;

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
          // Tri des offres par titre alphabétiquement
          this.offers = response.offres.sort((a: any, b: any) =>
            a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' })
          );
          this.applyFilters();
          console.log('Offres chargées et triées:', this.offers);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des offres:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredOffers = this.offers.filter(offer => {
      const matchesSearch = this.searchTerm
        ? (offer.titre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
           offer.description?.toLowerCase().includes(this.searchTerm.toLowerCase()))
        : true;
      const matchesContract = this.selectedContract
        ? offer.typeDeContrat?.toLowerCase() === this.selectedContract.toLowerCase()
        : true;
      return matchesSearch && matchesContract;
    });
  }

  editOffer(id: number): void {
    this.selectedOfferId = id;
  }

  closeEditModal(): void {
    this.selectedOfferId = null;
  }

  onOfferUpdated(): void {
    this.loadOffers();
    this.selectedOfferId = null;
  }

  deleteOffer(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      this.recruitmentService.deleteOffer(id).subscribe({
        next: () => {
          this.offers = this.offers.filter(offer => offer.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'offre:', error);
        }
      });
    }
  }

  viewApplicants(id: number): void {
    this.applicantsOfferId = id;
    this.showApplicantsModal = true;
  }

  goToCreateOffer(): void {
    this.router.navigate(['/admin/recruitments/add']);
  }

  closeApplicantsModal(): void {
    this.showApplicantsModal = false;
    this.applicantsOfferId = null;
  }
}
