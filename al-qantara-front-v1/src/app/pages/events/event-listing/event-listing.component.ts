import {Component, inject} from '@angular/core';
import { EventItemComponent } from './event-item/event-item.component';
import {NgForOf, NgIf} from '@angular/common';
import {EventDescriptionComponent} from '../event-description/event-description.component';
import {EventService} from '../../../member/services/event.service';
import {Event} from '../../../shared/models/event';
import { Router } from '@angular/router';
@Component({
  selector: 'app-event-listing',
  imports: [
    EventItemComponent,
    NgForOf,
    EventDescriptionComponent,
    NgIf
  ],
  templateUrl: './event-listing.component.html',
  standalone: true,
  styleUrl: './event-listing.component.scss'
})
export class EventListingComponent {
  eventService = inject(EventService);
  router = inject(Router);

  events:Event[] = [];

  showModal = false;
  selectedEvent: any = null;

  openModal(event: any) {
    this.selectedEvent = event;
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
    this.selectedEvent = null;
  }

  ngOnInit() {
    this.events = this.eventService.getAllEvents();

    // Récupère l'id depuis le state de l'historique
    const openEventId = history.state?.openEventId;
    if (openEventId) {
      const event = this.events.find(e => e.id === openEventId);
      if (event) {
        this.openModal(event);
      }
    }
  }

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
