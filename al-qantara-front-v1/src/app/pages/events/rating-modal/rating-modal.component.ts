import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvenementService } from '../../../member/services/evenement.service';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss']
})
export class RatingModalComponent {
  @Input() eventId!: number;
  @Input() eventTitle!: string;
  @Output() close = new EventEmitter<void>();
  @Output() ratingSubmitted = new EventEmitter<void>();

  rating = {
    noteOrganisateur: 0,
    noteLieu: 0,
    noteAmbiance: 0,
    noteEvenement: 0,
    commentaire: ''
  };

  isSubmitting = false;
  error: string | null = null;

  constructor(private evenementService: EvenementService) {}

  setRating(type: keyof typeof this.rating, value: number) {
    if (type !== 'commentaire') {
      this.rating[type] = value;
    }
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  submitRating() {
    if (this.rating.noteOrganisateur === 0 || this.rating.noteLieu === 0 ||
        this.rating.noteAmbiance === 0 || this.rating.noteEvenement === 0) {
      this.error = 'Veuillez donner une note pour tous les critères';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    console.log('=== DÉBUT ENVOI NOTATION ===');
    console.log('Event ID:', this.eventId);
    console.log('Event Title:', this.eventTitle);
    console.log('Données de notation envoyées:', {
      noteOrganisateur: this.rating.noteOrganisateur,
      noteLieu: this.rating.noteLieu,
      noteAmbiance: this.rating.noteAmbiance,
      noteEvenement: this.rating.noteEvenement,
      commentaire: this.rating.commentaire
    });
    console.log('Rating object complet:', this.rating);

    this.evenementService.rateEvenement(this.eventId, this.rating).subscribe({
      next: (response) => {
        console.log('Notation envoyée avec succès!');
        console.log('Réponse du serveur:', response);
        this.ratingSubmitted.emit();
        this.close.emit();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi de la notation:', error);
        console.error('Details de l\'erreur:', error.error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.error = 'Erreur lors de l\'envoi de la notation';
        this.isSubmitting = false;
      },
      complete: () => {
        console.log('=== FIN ENVOI NOTATION ===');
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.close.emit();
  }
}
