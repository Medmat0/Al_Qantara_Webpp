
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GUIDES_MAROC, GuideVille } from './guides-maroc';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-decouverte-maroc',
  templateUrl: './decouverte-maroc.component.html',
  styleUrls: ['./decouverte-maroc.component.scss'],
  standalone: true,
  imports: [CommonModule, SafeUrlPipe]
})
export class DecouverteMarocComponent {
  guides: GuideVille[] = GUIDES_MAROC;
  selectedGuide: GuideVille = this.guides[0]; // Marrakech par défaut
  selectedPhoto: string | null = null;

  selectGuide(guide: GuideVille) {
    this.selectedGuide = guide;
  }

  openPhotoModal(photo: string) {
    this.selectedPhoto = photo;
  }

  closePhotoModal() {
    this.selectedPhoto = null;
  }

  getMapUrl(guide: GuideVille): string {
    const lat = guide.lat;
    const lng = guide.lng;
    const bbox = `${lng-0.05},${lat-0.05},${lng+0.05},${lat+0.05}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  }
}
