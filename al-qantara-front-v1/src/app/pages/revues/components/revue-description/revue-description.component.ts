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
  revue = new Revue('', 0, '', '', 0);
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
      next: (response: { fichier: string; titre: string; datePublication: string; description: string; createdBy: number }) => {
        // Handle successful response
        console.log('Revue fetched successfully:', response);
        const match = response.datePublication.match(this.dateRegex);
        if (match) {
          // Format date as MM-DD
          this.revue.datePublication = `${match[1]}-${match[2]}`;
        } else {
          console.error('Date format is incorrect:', response.datePublication);
        }
        // Update other fields
        this.revue.titre = response.titre;
        console.log('Revue title:', this.revue.titre);
        this.revue.fichier = response.fichier;
        console.log('Revue file:', this.revue.fichier);
        this.revue.createdBy = response.createdBy;
        console.log('Revue created by:', this.revue.createdBy);
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
