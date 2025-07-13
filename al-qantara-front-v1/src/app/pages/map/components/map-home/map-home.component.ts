import { Component } from '@angular/core';
import { MapListComponent } from '../map-list/map-list.component';
import { SpotDescriptionComponent } from '../spot-description/spot-description.component';
import {NgIf, NgStyle} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import L from 'leaflet';

@Component({
  selector: 'app-map-home',
  standalone: true,
  imports: [
    MapListComponent,
    SpotDescriptionComponent,
    NgIf,
    NgStyle,
  ],
  templateUrl: './map-home.component.html',
  styleUrl: './map-home.component.scss'
})
export class MapHomeComponent {
  showMapList = false;
  showSpotDescription = false;
  selectedSpot: any = null;
  MarocLatitude = 31.791702;
  MarocLongitude = -7.092619;

  map: any;

  showSpotsInedits = false;

  itineraireLayer: any = null;
  itineraireMarkers: any[] = [];


  constructor() {
  }

  ngAfterViewInit() {
    this.map = L.map('map').setView([this.MarocLatitude, this.MarocLongitude], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  fakeSpots = [
    {
      id: 1,
      name: 'Spot 1',
      description: 'Jolie montagne avec une vue imprenable',
      image: "https://picsum.photos/200/300",
      latitude: 29.791702,
      longitude: -8.092619
    },
    {
      id: 2,
      name: 'Spot 2',
      description: 'Maison traditionnelle avec un jardin magnifique',
      image: "https://picsum.photos/200/300",
      latitude: 30.291702,
      longitude: -8.292619
    }
  ];

  itineraires = [
    {
      id: 1,
      name: 'Itinéraire 1',
      image: "https://picsum.photos/200/300",
      description: 'Un itinéraire pittoresque à travers les montagnes',
      points: [
        [29.791702, -8.092619],
        [30.291702, -8.292619],
        [31.791702, -7.092619],
        [32.291702, -6.292619]
      ]
    },
    {
      id: 2,
      name: 'Itinéraire 2',
      image: "https://picsum.photos/200/300",
      description: 'Un itinéraire culturel à travers les villages berbères',
      points: [
        [29.791702, -8.092619],
        [30.291702, -8.292619],
        [31.791702, -7.092619]
      ]
    },
    {
      id: 3,
      name: 'Itinéraire 3',
      image: "https://picsum.photos/200/300",
      description: 'Un itinéraire aventureux à travers les dunes de sable',
      points: [
        [30.291702, -8.292619],
        [31.791702, -7.092619],
        [32.291702, -6.292619]
      ]
    }
  ];

  onItinerairesClick() {
    console.log('Itineraires clicked');
    this.showMapList = true;
    this.showSpotDescription = false;

    // Supprime les marqueurs de spots
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });
  }

  onSpotsIneditsClick() {
    console.log('Spots Inédits clicked');
    this.showMapList = false;
    this.showSpotDescription = false;
    this.showSpotsInedits = true;

    // Supprime le tracé d'itinéraire s'il existe
    if (this.itineraireLayer) {
      this.map.removeLayer(this.itineraireLayer);
      this.itineraireLayer = null;
    }
    // Supprime les marqueurs d'itinéraire s'ils existent
    if (this.itineraireMarkers && this.itineraireMarkers.length) {
      this.itineraireMarkers.forEach(marker => this.map.removeLayer(marker));
      this.itineraireMarkers = [];
    }

    // Supprime les anciens marqueurs de spots
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });

    // Ajoute les marqueurs
    this.fakeSpots.forEach(spot => {
      L.marker([spot.latitude, spot.longitude]).addTo(this.map)
        .on('click', () => this.onSpotMarkerClick(spot));
    });
  }

  onSpotMarkerClick(spot: any) {
    console.log('Marker clicked:', spot);
    this.selectedSpot = spot;
    this.showSpotDescription = true;
    this.showMapList = false;
  }

  onTraceItineraire(itineraire: any) {
    // Supprime l'ancien tracé et les anciens marqueurs
    if (this.itineraireLayer) {
      this.map.removeLayer(this.itineraireLayer);
    }
    if (this.itineraireMarkers && this.itineraireMarkers.length) {
      this.itineraireMarkers.forEach(marker => this.map.removeLayer(marker));
    }
    this.itineraireMarkers = [];

    // Trace la polyline de l'itinéraire
    this.itineraireLayer = L.polyline(itineraire.points, { color: 'red' }).addTo(this.map);
    this.map.fitBounds(this.itineraireLayer.getBounds());

    // Ajoute un marker sur chaque point de l'itinéraire
    itineraire.points.forEach((point: [number, number], idx: number) => {
      const marker = L.marker(point).addTo(this.map)
        .on('click', () => {
          this.selectedSpot = {
            name: `${itineraire.name} - Point ${idx + 1}`,
            description: itineraire.description,
            image: itineraire.image
          };
          this.showSpotDescription = true;
          this.showMapList = false;
        });
      this.itineraireMarkers.push(marker);
    });
  }

}
