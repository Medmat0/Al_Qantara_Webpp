import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-description',
  standalone: true,
  templateUrl: './event-description.component.html',
  imports: [
    NgIf,
    FormsModule,
    DatePipe,
    NgForOf,
    CommonModule
  ],
  styleUrl: './event-description.component.scss'
})
export class EventDescriptionComponent implements OnChanges {
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
  constructor(private sanitizer: DomSanitizer) {}
  commentText = '';
  showCommentForm = false;


  ngOnChanges() {
    if (this.event) {
      this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.openstreetmap.org/export/embed.html?bbox=' +
        (this.event.longitude - 0.01) + ',' +
        (this.event.latitude - 0.01) + ',' +
        (this.event.longitude + 0.01) + ',' +
        (this.event.latitude + 0.01) +
        '&layer=mapnik&marker=' + this.event.latitude + ',' + this.event.longitude
      );
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
}
