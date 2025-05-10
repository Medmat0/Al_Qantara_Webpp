import {Component, Input} from '@angular/core';
import {Event} from '../../../../shared/models/event';

@Component({
  selector: 'app-event-item',
  imports: [],
  templateUrl: './event-item.component.html',
  standalone: true,
  styleUrl: './event-item.component.scss'
})
export class EventItemComponent {
  @Input() event!: Event;

}
