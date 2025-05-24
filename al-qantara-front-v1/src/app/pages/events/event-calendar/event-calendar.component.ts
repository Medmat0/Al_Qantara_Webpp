import {Component, Input} from '@angular/core';
import {Evenement} from '../../../member/models/evenement';

@Component({
  selector: 'app-event-calendar',
  imports: [],
  templateUrl: './event-calendar.component.html',
  standalone: true,
  styleUrl: './event-calendar.component.scss'
})
export class EventCalendarComponent {

  @Input() events: Evenement[] = [];

}
