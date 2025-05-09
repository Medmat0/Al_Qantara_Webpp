import { Component } from '@angular/core';
import {NgIf} from '@angular/common';
import {EventCalendarComponent} from '../event-calendar/event-calendar.component';
import {EventListingComponent} from '../event-listing/event-listing.component';
import {EventDescriptionComponent} from '../event-description/event-description.component';

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
export class EventHomeComponent {
  isCalendarView = false;

  toggleView(view:boolean): void {
    this.isCalendarView = view;
  }

}
