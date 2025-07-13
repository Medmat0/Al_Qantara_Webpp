import { Component, EventEmitter, Input, Output } from '@angular/core';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-map-list',
  imports: [
    NgForOf
  ],
  templateUrl: './map-list.component.html',
  standalone: true,
  styleUrl: './map-list.component.scss'
})
export class MapListComponent {

  @Input() itineraires: any[] = [];
  @Output() traceItineraire = new EventEmitter<any>();

  onSelectItineraire(itineraire: any) {
    this.traceItineraire.emit(itineraire);
  }

}
