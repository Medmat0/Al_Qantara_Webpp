import { Component, Input } from '@angular/core';
import { Evenement } from '../../../../member/models/evenement';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-item',
  imports: [DatePipe],
  templateUrl: './event-item.component.html',
  standalone: true,
  styleUrl: './event-item.component.scss',
  providers: [DatePipe]
})
export class EventItemComponent {
  @Input() event!: Evenement;
}
