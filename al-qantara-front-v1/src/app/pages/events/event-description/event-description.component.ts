import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-event-description',
  standalone: true,
  imports: [],
  templateUrl: './event-description.component.html',
  styleUrl: './event-description.component.scss'
})
export class EventDescriptionComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}
  @Output() close = new EventEmitter<void>();


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/events'], {
        state: { openEventId: +id }
      });
    }
  }
}
