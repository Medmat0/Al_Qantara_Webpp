import { Component, Input } from '@angular/core';
import { Evenement } from '../../../../member/models/evenement';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-item',
  imports: [DatePipe, CommonModule],
  templateUrl: './event-item.component.html',
  standalone: true,
  styleUrl: './event-item.component.scss',
  providers: [DatePipe]
})
export class EventItemComponent {
  @Input() event!: Evenement;

  get eventImage(): string {
    if (Array.isArray(this.event.images) && this.event.images.length > 0 && this.event.images[0]) {
      return this.event.images[0];
    }
    return 'assets/main-icon.jpg';
  }
}
