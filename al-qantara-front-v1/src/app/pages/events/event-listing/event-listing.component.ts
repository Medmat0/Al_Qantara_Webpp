import { Component } from '@angular/core';
import { EventItemComponent } from './event-item/event-item.component';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-event-listing',
  imports: [
    EventItemComponent,
    NgForOf
  ],
  templateUrl: './event-listing.component.html',
  standalone: true,
  styleUrl: './event-listing.component.scss'
})
export class EventListingComponent {

  events = [
    {
      id: 1,
      titre: 'Concert de Jazz',
      description: 'Venez profiter d\'une soirée de jazz en plein air.',
      image: 'https://picsum.photos/id/237/200/300',
      nombrePlaces: 100,
      tags: ['jazz', 'concert', 'musique'],
      dateDebut: new Date('2023-10-01T20:00:00'),
      dateFin: new Date('2023-10-01T23:00:00'),
      lieu: 'Parc Central',
      datePublication: new Date(),
      createdBy: 1
    },
    {
      id: 2,
      titre: 'Exposition d\'art contemporain',
      description: 'Découvrez les dernières tendances de l\'art contemporain.',
      image: 'https://picsum.photos/id/236/200/300',
      nombrePlaces: 50,
      tags: ['art', 'exposition', 'culture'],
      dateDebut: new Date('2023-10-05T10:00:00'),
      dateFin: new Date('2023-10-05T18:00:00'),
      lieu: 'Musée d\'Art Moderne',
      datePublication: new Date(),
      createdBy: 2
    },
    {
      id: 3,
      titre: 'Festival de cinéma',
      description: 'Participez à notre festival de cinéma avec des projections en plein air.',
      image: 'https://picsum.photos/id/239/200/300',
      nombrePlaces: 200,
      tags: ['cinéma', 'festival', 'films'],
      dateDebut: new Date('2023-10-10T19:00:00'),
      dateFin: new Date('2023-10-12T23:00:00'),
      lieu: 'Place de la République',
      datePublication: new Date(),
      createdBy: 3
    },
    {
      id: 4,
      titre: 'Atelier de cuisine',
      description: 'Apprenez à cuisiner des plats délicieux avec notre chef.',
      image: 'https://picsum.photos/id/241/200/300',
      nombrePlaces: 20,
      tags: ['cuisine', 'atelier', 'gastronomie'],
      dateDebut: new Date('2023-10-15T14:00:00'),
      dateFin: new Date('2023-10-15T17:00:00'),
      lieu: 'École de Cuisine',
      datePublication: new Date(),
      createdBy: 4
    }
  ];

  currentPage: number = 1;
  itemsPerPage: number = 6;

  get filteredEvents() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.events.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
