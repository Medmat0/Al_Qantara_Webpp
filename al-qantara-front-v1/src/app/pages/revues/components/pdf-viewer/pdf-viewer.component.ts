import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PreventContextMenuDirective } from '../../directives/prevent-context-menu.directive';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, NgxExtendedPdfViewerModule, PreventContextMenuDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="pdf-viewer-container" preventContextMenu>
      <ngx-extended-pdf-viewer
        *ngIf="pdfSrc"
        [src]="pdfSrc"
        [height]="'90vh'"
        [useBrowserLocale]="true"
        [showToolbar]="true"
        [showSecondaryToolbarButton]="false"
        [showPresentationModeButton]="true"
        [showSpreadButton]="true"
        [showSidebarButton]="false"
        [showFindButton]="false"
        [showHandToolButton]="false"
        [showRotateButton]="false"
        [showScrollingButton]="false"
        [showZoomButtons]="false"
        [showDownloadButton]="false"
        [showPagingButtons]="true"
        [showPrintButton]="false"
        [showBookmarkButton]="false"
        [showOpenFileButton]="false"
        [enablePrint]="false"
        [showEditorButton]="false"
        [showDrawEditor]="false"
        [showAnnotationEditor]="false"
        [showTextEditor]="false"
        [showStampEditor]="false"
        [showInkEditor]="false"
        [fullScreen]="true"
        [zoom]="'auto'"
        [spread]="'off'"
        [language]="'fr'"
        [delayFirstView]="1000"
        [copy]="false"
        [printResolution]="0"
        [ignoreKeyboard]="false"
        [ignoreKeys]="['ctrl+s', 'ctrl+p', 'ctrl+shift+i']">
      </ngx-extended-pdf-viewer>
      <div *ngIf="!pdfSrc" class="loading">
        Chargement du PDF...
      </div>
    </div>
  `,
  styles: [`
    .pdf-viewer-container {
      width: 100%;
      height: 90vh;
      margin: 20px auto;
      background-color: #f0f0f0;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    .loading {
      text-align: center;
      padding: 20px;
      font-size: 18px;
    }

    ::ng-deep .textLayer {
      user-select: none !important;
      pointer-events: none !important;
    }

    ::ng-deep img {
      pointer-events: none !important;
    }
  `]
})
export class PdfViewerComponent implements OnInit {
  pdfSrc: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const pdfUrl = this.route.snapshot.queryParamMap.get('url');
    console.log('PDF URL received (encoded):', pdfUrl);
    
    if (pdfUrl) {
      try {
        const decodedUrl = decodeURIComponent(pdfUrl);
        console.log('PDF URL decoded:', decodedUrl);
        this.loadPdfFromCloudinary(decodedUrl);
      } catch (error) {
        console.error('Error decoding URL:', error);
      }
    } else {
      console.error('No PDF URL provided');
    }
  }

  private loadPdfFromCloudinary(url: string) {
    console.log('Loading PDF from:', url);
    
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    this.http.get(url, { 
      responseType: 'blob',
      headers: headers,
      observe: 'response'
    }).subscribe({
      next: (response) => {
        console.log('Response headers:', response.headers);
        console.log('Response status:', response.status);
        console.log('Response type:', response.body?.type);
        
        if (response.body) {
          const blob = response.body;
          console.log('PDF blob received, size:', blob.size, 'bytes');
          console.log('Blob type:', blob.type);
          
          // Création de l'URL du blob
          this.pdfSrc = URL.createObjectURL(blob);
          console.log('Created Blob URL:', this.pdfSrc);
        } else {
          console.error('Response body is null');
        }
      },
      error: (error) => {
        console.error('Error loading PDF:', error);
        if (error.status) {
          console.error('HTTP Status:', error.status);
          console.error('Status Text:', error.statusText);
        }
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            console.error('Error response:', reader.result);
          };
          reader.readAsText(error.error);
        }
      }
    });
  }
}
