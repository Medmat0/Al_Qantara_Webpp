import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Offre } from '../../../../member/models/offre';
import { CandidatureFormComponent } from "./components/candidature-form/candidature-form.component";
import { OffreService } from '../../../../member/services/offre.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-offre-description',
  imports: [CommonModule, CandidatureFormComponent, NgFor],
  templateUrl: './offre-description.component.html',
  standalone: true,
  styleUrl: './offre-description.component.scss'
})
export class OffreDescriptionComponent implements OnInit {
  offre: Offre | null = null;
  offreService = inject(OffreService);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      const id = Number(paramMap.get('id'));
      if (id) {
        this.fetchOffreDetails(id);
      }
    });
  }

  fetchOffreDetails(id: number) {
    this.offreService.getOffreById(id).subscribe({
      next: (response: any) => {
        if (!response || !response.offre) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.offre = response.offre;
      },
      error: (error: any) => {
        console.error('Error fetching offre:', error);
        this.router.navigate(['/not-found']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/recruitment']);
  }

  scrollToForm(): void {
    const formSection = document.getElementById('application-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  shareOffer(): void {
    if (this.offre) {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: this.offre.titre,
          text: this.offre.description,
          url
        });
      } else {
        navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papier !');
      }
    }
  }

}
