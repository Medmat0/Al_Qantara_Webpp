import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruitmentService } from '../../services/recruitment.service';
import { Router } from '@angular/router';
import { EditRecruitmentComponent } from '../edit-recruitment/edit-recruitment.component';

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

@Component({
  selector: 'app-manage-recruitment',
  templateUrl: './manage-recruitment.component.html',
  styleUrls: ['./manage-recruitment.component.scss'],
  standalone: true,
  imports: [CommonModule, EditRecruitmentComponent]
})
export class ManageRecruitmentComponent implements OnInit {
  offers: Offer[] = [];
  selectedOfferId: number | null = null;

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
          console.log('Offres chargées et triées:', this.offers);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des offres:', error);
      }
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

 /* addNewOffer(): void {
    this.router.navigate(['/admin/recruitments/add']);
  }*/
}
