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
  showRouteMap: boolean = false;
  debugMode: boolean = false; // Pour ajuster les positions

  selectGuide(guide: GuideVille) {
    this.selectedGuide = guide;
    this.showRouteMap = false; // Reset route view when changing city
  }

  openPhotoModal(photo: string) {
    this.selectedPhoto = photo;
  }

  closePhotoModal() {
    this.selectedPhoto = null;
  }

  showRoute() {
    this.showRouteMap = !this.showRouteMap;
  }

  openFullRoute() {
    // Ouvrir Google Maps avec le trajet dans une nouvelle fenêtre
    const guide = this.selectedGuide;
    if (guide.pointsInteret.length < 2) return;
    
    const origin = `${guide.pointsInteret[0].lat},${guide.pointsInteret[0].lng}`;
    const destination = `${guide.pointsInteret[guide.pointsInteret.length - 1].lat},${guide.pointsInteret[guide.pointsInteret.length - 1].lng}`;
    
    let waypoints = '';
    if (guide.pointsInteret.length > 2) {
      const middlePoints = guide.pointsInteret.slice(1, -1);
      waypoints = middlePoints.map(poi => `${poi.lat},${poi.lng}`).join('|');
    }
    
    const waypointsParam = waypoints ? `&waypoints=${waypoints}` : '';
    const url = `https://www.google.com/maps/dir/${origin}/${destination}${waypointsParam ? '/' + waypoints.replace(/\|/g, '/') : ''}`;
    
    window.open(url, '_blank');
  }

  getMapUrl(guide: GuideVille): string {
    const lat = guide.lat;
    const lng = guide.lng;
    
    // Créer les waypoints pour le trajet
    const waypoints = guide.pointsInteret.map(poi => `${poi.lat},${poi.lng}`).join('|');
    
    // URL pour OpenRouteService avec trajet
    const bbox = `${lng-0.05},${lat-0.05},${lng+0.05},${lat+0.05}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  }

  getRouteUrl(guide: GuideVille): string {
    if (guide.pointsInteret.length < 2) {
      return this.getMapUrl(guide);
    }
    
    // Calculer les limites pour inclure tous les points d'intérêt
    const lats = guide.pointsInteret.map(poi => poi.lat);
    const lngs = guide.pointsInteret.map(poi => poi.lng);
    
    // Calculer la dispersion des points pour ajuster les marges
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    
    // Marge adaptative : plus petite si les points sont dispersés, plus grande s'ils sont proches
    const adaptiveMargin = Math.max(0.003, Math.min(0.01, Math.max(latRange, lngRange) * 0.2));
    
    const minLat = Math.min(...lats) - adaptiveMargin;
    const maxLat = Math.max(...lats) + adaptiveMargin;
    const minLng = Math.min(...lngs) - adaptiveMargin;
    const maxLng = Math.max(...lngs) + adaptiveMargin;
    
    // URL vers OpenStreetMap avec bbox adaptatif
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
  }

  getMarkerPosition(poi: any, axis: 'x' | 'y'): number {
    if (!this.showRouteMap) return 0;
    
    // Calculer les limites exactes utilisées par la carte
    const lats = this.selectedGuide.pointsInteret.map(p => p.lat);
    const lngs = this.selectedGuide.pointsInteret.map(p => p.lng);
    
    // Calculer la dispersion des points pour ajuster les marges
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    
    // Marge adaptative : même calcul que dans getRouteUrl
    const adaptiveMargin = Math.max(0.003, Math.min(0.01, Math.max(latRange, lngRange) * 0.2));
    
    const minLat = Math.min(...lats) - adaptiveMargin;
    const maxLat = Math.max(...lats) + adaptiveMargin;
    const minLng = Math.min(...lngs) - adaptiveMargin;
    const maxLng = Math.max(...lngs) + adaptiveMargin;
    
    if (axis === 'x') {
      // Position horizontale (longitude)
      // Compensation pour la projection Mercator et les marges de l'iframe
      const basePosition = ((poi.lng - minLng) / (maxLng - minLng)) * 100;
      // Ajouter une marge de 10% de chaque côté pour compenser l'iframe
      const adjustedPosition = 10 + (basePosition * 0.8);
      return Math.max(10, Math.min(90, adjustedPosition));
    } else {
      // Position verticale (latitude) - inversée car les coordonnées Y sont inversées dans le DOM
      const basePosition = ((maxLat - poi.lat) / (maxLat - minLat)) * 100;
      // Ajouter une marge de 10% en haut et en bas pour compenser l'iframe
      const adjustedPosition = 10 + (basePosition * 0.8);
      return Math.max(10, Math.min(90, adjustedPosition));
    }
  }

  // Positions calibrées manuellement pour chaque ville
  getCalibratedMarkerPosition(poi: any, axis: 'x' | 'y'): number {
    const cityId = this.selectedGuide.id;
    
    // Positions calibrées pour chaque point d'intérêt par ville
    const calibratedPositions: any = {
      'marrakech': {
        'Place Jemaa el-Fna': { x: 45, y: 60 },
        'Jardin Majorelle': { x: 30, y: 25 },
        'Palais de la Bahia': { x: 55, y: 70 },
        'Souks de la médina': { x: 50, y: 50 },
        'Koutoubia': { x: 40, y: 65 }
      },
      'fes': {
        'Médina de Fès el-Bali': { x: 50, y: 40 },
        'Tanneries Chouara': { x: 60, y: 35 },
        'Médersa Bou Inania': { x: 45, y: 45 },
        'Bab Boujloud': { x: 40, y: 50 }
      },
      'agadir': {
        'Plage d\'Agadir': { x: 45, y: 65 },
        'La Kasbah': { x: 50, y: 25 },
        'Souk El Had': { x: 60, y: 45 },
        'Marina d\'Agadir': { x: 35, y: 70 }
      }
    };
    
    const cityPositions = calibratedPositions[cityId];
    if (cityPositions && cityPositions[poi.nom]) {
      return cityPositions[poi.nom][axis];
    }
    
    // Fallback sur le calcul automatique
    return this.getMarkerPosition(poi, axis);
  }

  focusOnPoint(poi: any) {
    // Ouvrir OpenStreetMap centré sur ce point dans un nouvel onglet
    const url = `https://www.openstreetmap.org/?mlat=${poi.lat}&mlon=${poi.lng}&zoom=16#map=16/${poi.lat}/${poi.lng}`;
    window.open(url, '_blank');
  }

  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    console.log('Debug mode:', this.debugMode ? 'ON' : 'OFF');
    if (this.debugMode) {
      console.log('Current city:', this.selectedGuide.nom);
      console.log('Points d\'intérêt:', this.selectedGuide.pointsInteret);
    }
  }

  onMarkerClick(poi: any, event: MouseEvent) {
    if (this.debugMode) {
      // En mode debug, afficher les coordonnées du clic
      const rect = (event.target as HTMLElement).closest('.map-main')?.getBoundingClientRect();
      if (rect) {
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        console.log(`${poi.nom}: { x: ${x.toFixed(0)}, y: ${y.toFixed(0)} }`);
      }
    } else {
      this.focusOnPoint(poi);
    }
  }
}
