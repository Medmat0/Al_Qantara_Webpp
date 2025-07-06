import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  templateUrl: './event-modal.component.html',
  imports: [
    NgIf,
    FormsModule,
    DatePipe,
    NgForOf,
    CommonModule,
    PaymentModalComponent

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
  @Input() unsubscribeConfirmed = false;
  @Output() close = new EventEmitter<void>();
  @Output() like = new EventEmitter<void>();
  @Output() comment = new EventEmitter<string>();
  @Output() participate = new EventEmitter<void>();
  @Output() unsubscribe = new EventEmitter<void>();

  safeMapUrl: SafeResourceUrl | null = null;
  commentText = '';
  showCommentForm = false;
  showComments = false;

  showPaymentModal = false;
  errorMessage = '';
  loadingPayment = false;
  errorPaymentMessage = '';

  //share
  showShareMenu = false;
  @Output() shareByMessageEvent = new EventEmitter<any>();



  constructor(private sanitizer: DomSanitizer) {
    if (this.event && !Array.isArray(this.event.comments)) {
      this.event.comments = [];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
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

    if (changes['isParticipating'] && !changes['isParticipating'].currentValue) {
      this.participation = null;
    }
  }

  copyLink() {
    const url = `/events/${this.event?.id}`;
    navigator.clipboard.writeText(url);
    this.showShareMenu = false;
    alert('Lien copié !');
  }

  shareByMessage() {
    this.shareByMessageEvent.emit(this.event);
    this.showShareMenu = false;
  }


  shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    this.showShareMenu = false;
  }

  shareOnInstagram() {
    alert('Le partage direct sur Instagram n\'est pas supporté depuis le web.');
    this.showShareMenu = false;
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

  onPayWithHelloAsso() {
    this.errorPaymentMessage = '';
    const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
    if (
      utilisateur &&
      (utilisateur.id === this.event?.createur?.id ||
        utilisateur.email === this.event?.createur?.email)
    ) {
      this.errorPaymentMessage = "Le créateur de l'événement ne peut pas acheter de billet pour son propre événement.";
      return;
    }
    this.showPaymentModal = true;
  }

  handleShare() {
    const subject = `Invitation à l'événement: ${this.event.titre}`;
    const body = `Bonjour,\n\nJe vous invite à l'événement "${this.event.titre}" qui se déroulera le ${this.formatDateTime(this.event.dateDebut)} à ${this.event.lieu}.\n\nPour plus d'informations, visitez notre site web.\n\nCordialement`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.loadingPayment = false;
    this.errorMessage = '';
  }

  get eventImage(): string {
    if (Array.isArray(this.event?.images) && this.event.images.length > 0 && this.event.images[0]) {
      return this.event.images[0];
    }
    return 'assets/main-icon.jpg';
  }






}
