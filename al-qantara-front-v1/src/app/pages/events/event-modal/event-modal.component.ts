import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  templateUrl: './event-modal.component.html',
  imports: [
    NgIf,
    FormsModule,
    DatePipe,
    NgForOf,
    CommonModule
  ],
  styleUrl: './event-modal.component.scss'
})
export class EventModalComponent implements OnChanges {
  @Input() event: any;
  @Input() participation: any;
  @Input() isParticipating = false;
  @Input() loading = false;
  @Input() error = '';
  @Input() hasLikedEvenement = false;
  @Output() close = new EventEmitter<void>();
  @Output() like = new EventEmitter<void>();
  @Output() comment = new EventEmitter<string>();
  @Output() participate = new EventEmitter<void>();
  @Output() unsubscribe = new EventEmitter<void>();
  @Input() unsubscribeConfirmed = false;
  safeMapUrl: SafeResourceUrl | null = null;
  commentText = '';
  showCommentForm = false;
  showComments = false;
  
  constructor(private sanitizer: DomSanitizer) {
    if (this.event && !Array.isArray(this.event.comments)) {
      this.event.comments = [];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update map URL when event changes
    if (changes['event'] && this.event) {
      this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.openstreetmap.org/export/embed.html?bbox=' +
        (this.event.longitude - 0.01) + ',' +
        (this.event.latitude - 0.01) + ',' +
        (this.event.longitude + 0.01) + ',' +
        (this.event.latitude + 0.01) +
        '&layer=mapnik&marker=' + this.event.latitude + ',' + this.event.longitude
      );
    }

    // Handle participation changes
    if (changes['isParticipating'] && !changes['isParticipating'].currentValue) {
      // If user is no longer participating, clear participation data
      this.participation = null;
    }
  }

  formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }

  handleCommentSubmit() {
    if (this.commentText.trim()) {  
      this.comment.emit(this.commentText);
      this.commentText = '';
      this.showCommentForm = false;
    }
  }

  handleShare() {
    const subject = `Invitation à l'événement: ${this.event.titre}`;
    const body = `Bonjour,\n\nJe vous invite à l'événement "${this.event.titre}" qui se déroulera le ${this.formatDateTime(this.event.dateDebut)} à ${this.event.lieu}.\n\nPour plus d'informations, visitez notre site web.\n\nCordialement`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  get eventImage(): string {
    if (Array.isArray(this.event?.images) && this.event.images.length > 0 && this.event.images[0]) {
      return this.event.images[0];
    }
    return 'assets/main-icon.jpg';
  }
}
