import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RevueService } from '../../../../member/services/revue.service';
import { Revue } from "../../../../shared/models/revue";

@Component({
  selector: 'app-revue-description',
  imports: [],
  templateUrl: './revue-description.component.html',
  standalone: true,
  styleUrls: ['./revue-description.component.scss']
})
export class RevueDescriptionComponent implements OnInit {
  revueService = inject(RevueService);
  revue = new Revue(0, '', '', '', '', '', '', 0, 0, 0);
  dateRegex = /\d{4}-(\d{2})-(\d{2})/;


  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.revue.id = Number(paramMap.get('id'));
      if (this.revue.id) {
        this.fetchRevueDetails(this.revue.id);
      }
    });
  }

  private fetchRevueDetails(id: number): void {
    this.revueService.getRevueById(id).subscribe({
      next: (response: Revue) => {
        console.log('Revue fetched successfully:', response);

        // Map response directly to the Revue model
        this.revue.id = response.id;
        this.revue.titre = response.titre;
        this.revue.description = response.description;
        this.revue.mois = response.mois;
        this.revue.annee = response.annee;
        this.revue.fichier = response.fichier;
        this.revue.datePublication = response.datePublication;
        this.revue.nombreVues = response.nombreVues;
        this.revue.nombreTelechargements = response.nombreTelechargements;
        this.revue.createdBy = response.createdBy;

        console.log('Mapped Revue:', this.revue);
      },
      error: (error: any) => {
        console.error('Error fetching revue:', error);
      }
    });
  }

  downloadFile(): void {
    if (this.revue.fichier) {
      window.location.href = this.revue.fichier;
    } else {
      console.error('File URL is not available');
    }
  }

  getPreviewUrl(pdfUrl: string): string {
    const onePage = pdfUrl.replace('/upload/', '/upload/pg_1/');
    return onePage.replace('.pdf', '.jpg');
  }
}
