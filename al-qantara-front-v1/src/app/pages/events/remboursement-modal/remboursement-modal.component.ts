import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RemboursementService } from '../../../services/remboursement.service';

@Component({
  selector: 'app-remboursement-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close.emit()">×</button>
        
        <h2>Demande de remboursement</h2>
        <p class="modal-subtitle">Événement : <strong>{{ event?.titre }}</strong></p>
        
        <form (ngSubmit)="onSubmit()" class="remboursement-form">
          <div class="form-group">
            <label for="raison">Raison de la demande :</label>
            <textarea 
              id="raison"
              [(ngModel)]="raison" 
              name="raison"
              rows="3" 
              class="form-control"
              placeholder="Expliquez brièvement la raison de votre demande de remboursement..."
              required>
            </textarea>
          </div>
          
          <div class="form-group">
            <label for="rib">RIB (Relevé d'Identité Bancaire) :</label>
            <input 
              type="text" 
              id="rib"
              [(ngModel)]="rib" 
              name="rib"
              class="form-control"
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              pattern="[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}"
              title="Format: FR suivi de 2 chiffres puis de votre numéro de compte"
              required>
            <small class="help-text">
              Format attendu : FR suivi de 2 chiffres puis de votre numéro de compte (ex: FR76 1234 5678 9012 3456 7890 123)
            </small>
          </div>
          
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          
          <div class="modal-actions">
            <button type="button" (click)="close.emit()" class="btn-cancel" [disabled]="isLoading">
              Annuler
            </button>
            <button type="submit" class="btn-submit" [disabled]="!isFormValid() || isLoading">
              {{ isLoading ? 'Envoi en cours...' : 'Envoyer la demande' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      position: relative;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background-color: #f3f4f6;
    }

    h2 {
      color: #dc2626;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .modal-subtitle {
      color: #6b7280;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .remboursement-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }

    .help-text {
      font-size: 0.8rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .btn-cancel {
      padding: 0.75rem 1.5rem;
      background: #f3f4f6;
      color: #374151;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-cancel:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .btn-submit {
      padding: 0.75rem 1.5rem;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #b91c1c;
    }

    .btn-submit:disabled,
    .btn-cancel:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .modal-content {
        padding: 1.5rem;
        margin: 1rem;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class RemboursementModalComponent {
  @Input() event: any;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<any>();

  raison: string = '';
  rib: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private remboursementService: RemboursementService) {}

  isFormValid(): boolean {
    return this.raison.trim().length > 0 && this.rib.trim().length > 0;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.remboursementService.demanderRemboursement(this.event.id, this.raison, this.rib).subscribe({
      next: (response) => {
        this.success.emit(response);
        this.close.emit();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la demande de remboursement:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de l\'envoi de la demande';
        this.isLoading = false;
      }
    });
  }
}
