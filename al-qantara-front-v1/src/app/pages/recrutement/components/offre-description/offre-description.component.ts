import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Offre } from '../../../../member/models/offre';
import { CandidatureFormComponent } from "./components/candidature-form/candidature-form.component";
import { OffreService } from '../../../../member/services/offre.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-offre-description',
  imports: [CommonModule, CandidatureFormComponent],
  templateUrl: './offre-description.component.html',
  standalone: true,
  styleUrl: './offre-description.component.scss'
})
export class OffreDescriptionComponent {


  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  offre!: Offre;
  offreService = inject(OffreService);

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.offre.id = Number(paramMap.get('id'));
      if (this.offre.id) {
        this.fetchOffreDetails(this.offre.id);
      }
    });
  }
  fetchOffreDetails(id: number) {
    this.offreService.getOffreById(id).subscribe({
      next: (response: Offre) => {
        console.log('Offre fetched successfully:', response);

        this.offre = response;

        console.log('Mapped Offre:', this.offre);
      },
      error: (error: any) => {
        console.error('Error fetching offre:', error);
      }
    });
  }


}
