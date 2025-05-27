import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Evenement } from '../../../member/models/evenement';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule],
  templateUrl: './event-calendar.component.html',
  styleUrl: './event-calendar.component.scss'
})
export class EventCalendarComponent implements OnInit {
  @Input() events: Evenement[] = [];
  @Output() eventClick = new EventEmitter<Evenement>();
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    locale: 'fr',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventClick: this.handleEventClick.bind(this)
  };

  ngOnInit() {
    this.updateEvents();
  }

  updateEvents() {
    if (this.events) {
      this.calendarOptions.events = this.events.map(event => ({
        id: event.id.toString(),
        title: event.titre,
        start: event.dateDebut,
        end: event.dateFin,
        description: event.description,
        extendedProps: {
          lieu: event.lieu,
          type: event.type,
          placesRestantes: event.placesRestantes,
          originalEvent: event // Store the full event object
        }
      }));
    }
  }

  handleEventClick(info: any) {
    console.log('Event clicked:', info.event);
    const originalEvent = info.event.extendedProps.originalEvent;
    if (originalEvent) {
      this.eventClick.emit(originalEvent);
    }
  }
}
