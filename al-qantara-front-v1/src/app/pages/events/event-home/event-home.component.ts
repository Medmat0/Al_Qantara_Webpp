import {Component, inject, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {EventCalendarComponent} from '../event-calendar/event-calendar.component';
import {EventListingComponent} from '../event-listing/event-listing.component';
import {EventDescriptionComponent} from '../event-description/event-description.component';
import {Evenement} from '../../../member/models/evenement';
import {EvenementService} from '../../../member/services/evenement.service';

@Component({
  selector: 'app-event-home',
  imports: [
    NgIf,
    EventCalendarComponent,
    EventListingComponent,
    EventDescriptionComponent
  ],
  templateUrl: './event-home.component.html',
  standalone: true,
  styleUrl: './event-home.component.scss'
})
export class EventHomeComponent implements OnInit {
  isCalendarView = false;
  eventService= inject(EvenementService);

  events:Evenement[]= [];

  toggleView(view:boolean): void {
    this.isCalendarView = view;
  }

  ngOnInit() {
    this.eventService.getAllEvenements().subscribe({
      next: (response) => {
        this.events = response;
      },
      error: (error) => {
        console.error('Error fetching events:', error);
      }
    })
  }





}
