import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GuideVille} from '../guides-maroc';
import L from 'leaflet';
import {AdminGuidesService, Guide} from '../../../admin/services/admin-guides.service';
import {GuidesService} from '../../../member/services/guides.service';
import { AfterViewInit } from '@angular/core';

import "leaflet/dist/leaflet.css";
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
export class DecouverteMarocComponent implements AfterViewInit, OnInit {
  guides: Guide[] = [];
  selectedGuide: Guide| null = null;
  selectedPhoto: string | null = null;
  selectedPoi: any = null;
  showRouteMap: boolean = false;
  showListOnMobile: boolean = false; // Pour afficher la liste des guides sur mobile
  debugMode: boolean = false; // Pour ajuster les positions
  isMobile: boolean = window.innerWidth <= 768; // Détecte si c'est un mobile

  overlayVisible: boolean = true;

  filters = {
    actif: 'all' as boolean | 'all',
    page: 1,
    limit: 10
  };

  map: any;
  itineraireLayer: any = null;
  itineraireMarkers: any[] = [];

  constructor(private guideService: AdminGuidesService) {
    this.loadGuides();
  }

  ngOnInit() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  ngAfterViewInit() {
    this.map = L.map('map').setView([31.791702, -7.092619], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }
  loadGuides() {
    // Charger les guides depuis le service
    this.guideService.getAllGuides(this.filters).subscribe({
      next: (response) => {
        console.log('Guides chargés:', response.data);
        this.guides = response.data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des guides:', error);
      }
    });
  }

  selectGuide(guide: Guide) {
    this.selectedGuide = guide;
    this.showRouteMap = false;
    this.showMainMarker(guide);
    if (this.isMobile) {
      this.showListOnMobile = true; // Ouvre la modale POI sur mobile
    }
  }
  openPhotoModal(photo: string) {
    this.selectedPhoto = photo;
  }

  closePhotoModal() {
    this.selectedPhoto = null;
  }

  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
  }

  toggleListOnMobile() {
    this.showListOnMobile = !this.showListOnMobile;
  }

  openPoiAndShowRoute(poi: any) {
    this.openPoiModal(poi);
    this.showRouteMap = true;

    // Ne retrace l’itinéraire que si ce n’est pas déjà affiché
    if (!this.itineraireLayer && this.selectedGuide) {
      this.traceItineraireGuide(this.selectedGuide);
    }

    // Centre et zoom sur le POI
    if (this.map && poi.latitude && poi.longitude) {
      this.map.setView([poi.latitude, poi.longitude], 16, { animate: true });
    }
  }

  openPoiModal(poi: any) {
    this.selectedPoi = poi;
  }

  closePoiModal() {
    this.selectedPoi = null;
  }

  showRoute() {
    this.showRouteMap = !this.showRouteMap;
    if (this.selectedGuide) {
      if (this.showRouteMap) {
        this.traceItineraireGuide(this.selectedGuide); // Affiche le tracé
      } else {
        this.showMainMarker(this.selectedGuide); // Affiche le marker principal
      }
    }
  }

  showMainMarker(guide: Guide) {
    // Nettoie l’ancien tracé et les anciens marqueurs
    if (this.itineraireLayer) {
      this.map.removeLayer(this.itineraireLayer);
      this.itineraireLayer = null;
    }
    if (this.itineraireMarkers.length) {
      this.itineraireMarkers.forEach(marker => this.map.removeLayer(marker));
      this.itineraireMarkers = [];
    }
    // Place le marker principal
    const marker = L.marker([guide.latitude, guide.longitude]).addTo(this.map);
    this.itineraireMarkers.push(marker);
    this.map.setView([guide.latitude, guide.longitude], 13);
  }
  // css des icones dans styles.scss
  getNumberedIcon(number: number) {
    return L.divIcon({
      className: 'custom-number-icon',
      html: `<div class="marker-pin"><span class="marker-number">${number}</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  }

  traceItineraireGuide(guide: Guide) {
    // Nettoie l’ancien tracé et les anciens marqueurs
    if (this.itineraireLayer) {
      this.map.removeLayer(this.itineraireLayer);
    }
    if (this.itineraireMarkers.length) {
      this.itineraireMarkers.forEach(marker => this.map.removeLayer(marker));
    }
    this.itineraireMarkers = [];

    // Récupère les points d’intérêt
    const points: [number, number][] = guide.pointsInteret.map(
      poi => [poi.latitude, poi.longitude] as [number, number]
    );

// Trace la polyline
    this.itineraireLayer = L.polyline(points as L.LatLngTuple[], { color: 'blue' }).addTo(this.map);
    this.map.fitBounds(this.itineraireLayer.getBounds());

    guide.pointsInteret.forEach((poi, idx) => {
      const marker = L.marker([poi.latitude, poi.longitude], { icon: this.getNumberedIcon(idx + 1) })
        .addTo(this.map)
        .on('click', () => {
          this.openPoiModal(poi);
        });
      this.itineraireMarkers.push(marker);
    });
  }

  openFullRoute() {
    // Ouvrir Google Maps avec le trajet dans une nouvelle fenêtre
    const guide = this.selectedGuide;
    if (!guide || !guide.pointsInteret || guide.pointsInteret.length < 2) return;

    const origin = `${guide.pointsInteret[0].latitude},${guide.pointsInteret[0].longitude}`;
    const destination = `${guide.pointsInteret[guide.pointsInteret.length - 1].latitude},${guide.pointsInteret[guide.pointsInteret.length - 1].longitude}`;

    let waypoints = '';
    if (guide.pointsInteret.length > 2) {
      const middlePoints = guide.pointsInteret.slice(1, -1);
      waypoints = middlePoints.map(poi => `${poi.latitude},${poi.longitude}`).join('|');
    }

    const waypointsParam = waypoints ? `&waypoints=${waypoints}` : '';
    const url = `https://www.google.com/maps/dir/${origin}/${destination}${waypointsParam ? '/' + waypoints.replace(/\|/g, '/') : ''}`;

    window.open(url, '_blank');
  }

  getMapUrl(guide: Guide | null): string {
    if (!guide) return '';
    const lat = guide.latitude;
    const lng = guide.longitude;
    const bbox = `${lng-0.05},${lat-0.05},${lng+0.05},${lat+0.05}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  }

  getRouteUrl(guide: Guide | null): string {
    if (!guide || !guide.pointsInteret || guide.pointsInteret.length < 2) {
      return this.getMapUrl(guide);
    }

    // Calculer les limites pour inclure tous les points d'intérêt
    const lats = guide.pointsInteret.map(poi => poi.latitude);
    const lngs = guide.pointsInteret.map(poi => poi.longitude);

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
    if (!this.showRouteMap || !this.selectedGuide) return 0;

    // Calculer les limites exactes utilisées par la carte
    const lats = this.selectedGuide.pointsInteret?.map(p => p.latitude) ?? [];
    const lngs = this.selectedGuide.pointsInteret?.map(p => p.longitude) ?? [];

    if (lats.length === 0 || lngs.length === 0) return 0;

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

  getCalibratedMarkerPosition(poi: any, axis: 'x' | 'y'): number {
    if (!this.selectedGuide) {
      // Fallback sur le calcul automatique si aucun guide sélectionné
      return this.getMarkerPosition(poi, axis);
    }
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
    if (this.debugMode && this.selectedGuide) {
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
