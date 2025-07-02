import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Offre } from '../../../../member/models/offre';
import { CandidatureFormComponent } from "./components/candidature-form/candidature-form.component";
import { OffreService } from '../../../../member/services/offre.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor } from '@angular/common';
@Component({
  selector: 'app-offre-description',
  imports: [CommonModule, CandidatureFormComponent,NgFor],
  templateUrl: './offre-description.component.html',
  standalone: true,
  styleUrl: './offre-description.component.scss'
})
export class OffreDescriptionComponent implements OnInit {


  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  offre: Offre = {
    id: 0,
    titre: '',
    description: '',
    tags: [],
    lieuDeTravail: '',
    typeDeContrat: 'CDI',
    dateDebut: '',
    datePublication: '',
    entreprise: '',
    salaire: '',
    teletravailPossible: false

  } as Offre;
  offreService = inject(OffreService);

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
        console.log('Mapped Offre:', this.offre);
      },
      error: (error: any) => {
        console.error('Error fetching offre:', error);
        this.router.navigate(['/not-found']);
      }
    });
  }


}
