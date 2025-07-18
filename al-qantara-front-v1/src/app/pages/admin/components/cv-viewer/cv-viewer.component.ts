import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-cv-viewer',
  standalone: true,
  imports: [CommonModule, NgxExtendedPdfViewerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './cv-viewer.component.html',
  styleUrls: ['./cv-viewer.component.scss']
})
export class CvViewerComponent implements OnChanges {
  @Input() isVisible: boolean = false;
  @Input() cvUrl: string = '';
  @Input() applicantName: string = '';
  @Output() close = new EventEmitter<void>();

  pdfSrc: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible'] && this.isVisible && this.cvUrl) {
      this.loadCvPdf();
    }
    if (changes['cvUrl'] && this.cvUrl && this.isVisible) {
      this.loadCvPdf();
    }
  }

  closeViewer() {
    this.close.emit();
    this.pdfSrc = '';
    this.error = '';
  }

  retryLoad() {
    this.error = '';
    this.loadCvPdf();
  }

  private loadCvPdf() {
    if (!this.cvUrl) {
      this.error = 'URL du CV non disponible';
      return;
    }

    this.loading = true;
    this.error = '';
    this.pdfSrc = '';


    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    this.http.get(this.cvUrl, {
      responseType: 'blob',
      headers: headers,
      observe: 'response'
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.body) {
          const blob = response.body;

          this.pdfSrc = URL.createObjectURL(blob);
        } else {
          this.error = 'Impossible de charger le CV';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading CV PDF:', error);
        this.error = 'Erreur lors du chargement du CV. Veuillez réessayer.';
      }
    });
  }
}
