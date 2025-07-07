import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RevueService } from '../../../../member/services/revue.service';
import { Revue } from "../../../../member/models/revue";

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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
        if (!response || !response.id) {
          this.router.navigate(['/not-found']);
          return;
        }

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
        this.router.navigate(['/not-found']);
      }
    });
  }

  downloadFile(): void {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    console.log('Is Admin Route:', isAdminRoute);

    if (!isAdminRoute) {
      this.revueService.addDownloadToRevue(this.revue.id).subscribe({
        next: (response) => {
          console.log('Download count updated successfully:', response);
          this.navigateToPdfViewer();
        },
        error: (error) => {
          console.error('Error updating download count:', error);
          this.navigateToPdfViewer();
        }
      });
    } else {
      console.log('On admin page, skipping request.');
      this.navigateToPdfViewer();
    }
  }

  private navigateToPdfViewer(): void {
    console.log('Navigating to PDF viewer with URL:', this.revue.fichier);
    this.router.navigate(['/revues/pdf-viewer'], {
      queryParams: { url: this.revue.fichier }
    });
  }

  getPreviewUrl(pdfUrl: string): string {
    const onePage = pdfUrl.replace('/upload/', '/upload/pg_1/');
    return onePage.replace('.pdf', '.jpg');
  }
}
