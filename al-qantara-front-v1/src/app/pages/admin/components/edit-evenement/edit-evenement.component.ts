import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AddressService, AddressSuggestion } from '../../../../member/services/address.service';
import { AdminEvenementService } from '../../../../admin/services/admin-evenement.service';
import { Evenement } from '../../../../member/models/evenement';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-evenement',
  templateUrl: './edit-evenement.component.html',
  styleUrls: ['./edit-evenement.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]


})
export class EditEvenementComponent implements OnInit {
  @Input() eventData: Evenement | null = null;
  @Output() eventUpdated = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  protected addressService = inject(AddressService);
  protected adminEvenementService = inject(AdminEvenementService);
  private searchSubject = new Subject<string>();

  addressSearchInput = '';
  addressSuggestions: AddressSuggestion[] = [];
  showSuggestions = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Propriétés pour la gestion des fichiers (comme add-evenement)
  selectedImages: File[] = [];
  selectedVideo: File | null = null;


  // Données originales pour comparaison
  private originalEventData: any = {};

  event = {
    id: 0,
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    numero: '',
    rue: '',
    codePostal: '',
    ville: '',
    isPaid: false,
    price: 0,
    type: '',
    placesTotal: null as number | null,
    images: [] as string[],
    video: null as string | null
  };

  formErrors = {
    titre: false,
    description: false,
    dateDebut: false,
    dateFin: false,
    rue: false,
    codePostal: false,
    ville: false,
    adresse: false,
    type: false,
    price: false
  };

  minEndDate = '';

  ngOnInit() {
    this.initializeAddressSearch();
    this.loadEventData();
  }

  private loadEventData() {
    if (this.eventData) {
      // Convertir les dates pour les inputs datetime-local
      const dateDebut = new Date(this.eventData.dateDebut);
      const dateFin = new Date(this.eventData.dateFin);

      this.event = {
        id: this.eventData.id,
        titre: this.eventData.titre,
        description: this.eventData.description,
        dateDebut: this.formatDateForInput(dateDebut),
        dateFin: this.formatDateForInput(dateFin),
        numero: '',
        rue: '',
        codePostal: '',
        ville: '',
        isPaid: this.eventData.isPayant || false,
        price: this.eventData.prix || 0,
        type: this.eventData.type || '',
        placesTotal: this.eventData.placesTotal || null,
        images: this.eventData.images || [],
        video: this.eventData.video || null
      };

      if (this.eventData.lieu) {
        this.addressSearchInput = this.eventData.lieu;
      }

      this.originalEventData = {
        ...this.event,
        originalLieu: this.eventData.lieu
      };

      // Définir la date minimum pour la date de fin
      this.updateMinEndDate();
    }
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private initializeAddressSearch() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query: string) => {
          if (query.length < 3) {
            return [];
          }
          return this.addressService.searchAddress(query);
        })
      )
      .subscribe({
        next: (suggestions) => {
          this.addressSuggestions = suggestions;
          this.showSuggestions = suggestions.length > 0;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche d\'adresse:', error);
          this.showSuggestions = false;
        }
      });
  }

  onAddressSearch(query: string) {
    this.addressSearchInput = query;
    this.searchSubject.next(query);
  }

  handleAddressSelect(suggestion: AddressSuggestion) {
    this.event.numero = suggestion.address?.house_number || '';
    this.event.rue = suggestion.address?.road || suggestion.address?.street || '';
    this.event.codePostal = suggestion.address?.postcode || '';
    this.event.ville = suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '';

    this.addressSearchInput = this.addressService.formatSuggestion(suggestion);
    this.showSuggestions = false;
  }

  onDateDebutChange() {
    this.updateMinEndDate();
  }

  private updateMinEndDate() {
    if (this.event.dateDebut) {
      this.minEndDate = this.event.dateDebut;
    }
  }

  onPaidChange() {
    if (!this.event.isPaid) {
      this.event.price = 0;
    }
  }

  // Méthode pour vérifier si la date de fin est après la date de début
  isEndDateAfterStartDate(): boolean {
    if (!this.event.dateDebut || !this.event.dateFin) {
      return true; // Si une des dates est manquante, on ne considère pas cela comme une erreur de comparaison
    }

    const debut = new Date(this.event.dateDebut);
    const fin = new Date(this.event.dateFin);

    return fin > debut;
  }

  onSubmit(_form: NgForm) {
    this.resetErrors();
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    // Créer un objet avec seulement les champs modifiés
    const changedData: any = {};

    // Comparer titre
    if (this.event.titre !== this.originalEventData.titre) {
      changedData.titre = this.event.titre;
    }

    // Comparer description
    if (this.event.description !== this.originalEventData.description) {
      changedData.description = this.event.description;
    }

    // Comparer dates
    if (this.event.dateDebut !== this.originalEventData.dateDebut) {
      changedData.dateDebut = new Date(this.event.dateDebut).toISOString();
    }

    if (this.event.dateFin !== this.originalEventData.dateFin) {
      changedData.dateFin = new Date(this.event.dateFin).toISOString();
    }

    // Comparer adresse - utiliser l'adresse du champ de recherche ou l'adresse construite
    const currentAddress = this.addressSearchInput || this.buildFullAddress();
    const originalAddress = this.originalEventData.originalLieu || '';
    if (currentAddress !== originalAddress) {
      changedData.adresse = currentAddress;
    }

    // Comparer type
    if (this.event.type !== this.originalEventData.type) {
      changedData.type = this.event.type;
    }

    // Comparer places
    if (this.event.placesTotal !== this.originalEventData.placesTotal) {
      changedData.placesTotal = this.event.placesTotal;
    }

    if (this.event.isPaid !== this.originalEventData.isPaid) {
      changedData.estPayant = this.event.isPaid;

      if (this.event.isPaid) {
        changedData.price = this.event.price;
      }
    }

    if (this.event.isPaid || this.originalEventData.isPaid) {
      if (this.event.price !== this.originalEventData.price) {
        changedData.price = this.event.price;
      }
    }
    // Comparer images
    if (JSON.stringify(this.event.images) !== JSON.stringify(this.originalEventData.images)) {
      changedData.images = this.event.images;
    }

    // Comparer vidéo
    if (this.event.video !== this.originalEventData.video) {
      changedData.video = this.event.video;
    }

    // Vérifier s'il y a des changements
    if (Object.keys(changedData).length === 0) {
      this.errorMessage = 'Aucune modification détectée.';
      this.isSubmitting = false;
      return;
    }

    console.log('Données à envoyer:', changedData);

    this.adminEvenementService.editEvenement(this.event.id, changedData).subscribe({
      next: (response: any) => {
        this.successMessage = 'Événement modifié avec succès !';
        this.isSubmitting = false;

        // Émettre l'événement mis à jour
        setTimeout(() => {
          this.eventUpdated.emit(response.evenement || response);
        }, 1000);
      },
      error: (error: any) => {
        console.error('Erreur lors de la modification:', error);
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la modification de l\'événement.';
        this.isSubmitting = false;
      }
    });
  }

  private buildFullAddress(): string {
    const parts = [];

    if (this.event.numero) parts.push(this.event.numero);
    if (this.event.rue) parts.push(this.event.rue);
    if (this.event.codePostal) parts.push(this.event.codePostal);
    if (this.event.ville) parts.push(this.event.ville);

    return parts.join(', ');
  }

  private buildOriginalAddress(): string {
    const parts = [];

    if (this.originalEventData.numero) parts.push(this.originalEventData.numero);
    if (this.originalEventData.rue) parts.push(this.originalEventData.rue);
    if (this.originalEventData.codePostal) parts.push(this.originalEventData.codePostal);
    if (this.originalEventData.ville) parts.push(this.originalEventData.ville);

    return parts.join(', ');
  }

  private validateForm(): boolean {
    let isValid = true;

    // Réinitialiser les erreurs
    this.resetErrors();

    if (!this.event.titre || !this.event.titre.trim()) {
      this.formErrors.titre = true;
      isValid = false;
    }

    if (!this.event.description || !this.event.description.trim()) {
      this.formErrors.description = true;
      isValid = false;
    }

    if (!this.event.dateDebut) {
      this.formErrors.dateDebut = true;
      isValid = false;
    }

    if (!this.event.dateFin) {
      this.formErrors.dateFin = true;
      isValid = false;
    } else if (this.event.dateDebut && this.event.dateFin) {
      // Vérifier que la date de fin est après la date de début
      const debut = new Date(this.event.dateDebut);
      const fin = new Date(this.event.dateFin);

      if (fin <= debut) {
        this.formErrors.dateFin = true;
        isValid = false;
      }
    }

    // Valider l'adresse - utiliser le champ de recherche ou les champs séparés
    const hasAddressSearch = this.addressSearchInput && this.addressSearchInput.trim().length > 0;
    const hasAddressFields = this.event.rue && this.event.rue.trim() && this.event.ville && this.event.ville.trim();

    if (!hasAddressSearch && !hasAddressFields) {
      this.formErrors.adresse = true;
      isValid = false;
    }

    if (!this.event.type) {
      this.formErrors.type = true;
      isValid = false;
    }

    if (this.event.isPaid && (!this.event.price || this.event.price <= 0)) {
      this.formErrors.price = true;
      isValid = false;
    }

    return isValid;
  }

  private resetErrors() {
    this.formErrors = {
      titre: false,
      description: false,
      dateDebut: false,
      dateFin: false,
      rue: false,
      codePostal: false,
      ville: false,
      adresse: false,
      type: false,
      price: false
    };
  }

  onCancel() {
    this.cancel.emit();
  }

  // Méthodes pour la gestion des fichiers (identiques à add-evenement)
  onImagesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedImages = Array.from(target.files);
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    if (this.event.images) {
      this.event.images.splice(index, 1);
    }
  }

  onVideoSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedVideo = target.files[0];
    }
  }

  removeVideo(): void {
    this.selectedVideo = null;
    // Reset the file input
    const videoInput = document.getElementById('video') as HTMLInputElement;
    if (videoInput) {
      videoInput.value = '';
    }
  }

  removeExistingVideo(): void {
    this.event.video = null;
  }
}
