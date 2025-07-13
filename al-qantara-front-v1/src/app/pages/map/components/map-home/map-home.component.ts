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
  safeMapUrl: any;
  MarocLatitude = 31.791702;
  MarocLongitude = -7.092619;

  map: any;

  showSpotsInedits = false;

  constructor(private sanitizer: DomSanitizer) {

    this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.openstreetmap.org/export/embed.html?bbox=' +
      (this.MarocLongitude - 5.5) + ',' +
      (this.MarocLatitude- 5.5) + ',' +
      (this.MarocLongitude + 5.5) + ',' +
      (this.MarocLatitude + 5.5)
    );
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
      description: 'Description of Spot 1',
      latitude: 29.791702,
      longitude: -8.092619
    },
    {
      id: 2,
      name: 'Spot 2',
      description: 'Description of Spot 2',
      latitude: 30.291702,
      longitude: -8.292619
    }
  ];

  onItinerairesClick() {
    console.log('Itineraires clicked');
    this.showMapList = true;
    this.showSpotDescription = false;
  }

  onSpotsIneditsClick() {
    console.log('Spots Inédits clicked');
    this.showMapList = false;
    this.showSpotDescription = false;
    this.showSpotsInedits = true

    // Supprime les anciens marqueurs si besoin
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) this.map.removeLayer(layer);
    });

    // Ajoute les marqueurs OSM
    this.fakeSpots.forEach(spot => {
      L.marker([spot.latitude, spot.longitude]).addTo(this.map)
        .bindPopup(`<b>${spot.name}</b><br>${spot.description}`)
        .on('click', () => this.onSpotMarkerClick(spot));
    });
  }

  onSpotMarkerClick(spot: any) {
    this.selectedSpot = spot;
    this.showSpotDescription = true;
    this.showMapList = false;
  }

}
