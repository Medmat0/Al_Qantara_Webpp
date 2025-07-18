import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-join-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-modal.component.html',
  styleUrls: ['./join-modal.component.scss']
})
export class JoinModalComponent {
  @Input() communityId: string | null = null;
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router, private route: ActivatedRoute) {
    // Récupère l'id de la communauté depuis l'URL
    this.route.url.subscribe(segments => {
      const idSegment = segments.find(seg => !isNaN(+seg.path));
      this.communityId = idSegment ? idSegment.path : null;
    });
  }

  onAccept() {
    if (this.communityId) {
      this.router.navigate([`/communities/${this.communityId}`]);
    } else {
      this.router.navigate(['/communities']);
    }
    this.close.emit();
  }

  onCancel() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
