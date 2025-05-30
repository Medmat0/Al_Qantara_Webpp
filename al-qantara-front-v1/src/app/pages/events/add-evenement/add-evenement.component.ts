import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AddressService, AddressSuggestion } from '../../../member/services/address.service';
import { EvenementService } from '../../../member/services/evenement.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-add-evenement',
  templateUrl: './add-evenement.component.html',
  styleUrls: ['./add-evenement.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AddEvenementComponent {
  @Output() eventCreated = new EventEmitter<any>();

  protected addressService = inject(AddressService);
  protected evenementService = inject(EvenementService);
  private searchSubject = new Subject<string>();
  addressSearchInput = '';
  addressSuggestions: AddressSuggestion[] = [];
  showSuggestions = false;
  isSubmitting = false;
  errorMessage = '';

  event = {
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    numero: '',
    rue: '',
    codePostal: '',
    ville: '',
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
    adresse: false,
    type: false
  };

  selectedImages: File[] = [];
  selectedVideo: File | null = null;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => this.addressService.searchAddress(query))
    ).subscribe(suggestions => {
      this.addressSuggestions = suggestions;
      this.showSuggestions = suggestions.length > 0;
    });
  }

  onAddressSearch(value: string): void {
    this.addressSearchInput = value;
    this.searchSubject.next(value);
  }

  handleAddressSelect(suggestion: AddressSuggestion): void {
    const address = suggestion.address;
    
    this.event.numero = address.house_number || '';
    this.event.rue = address.road || address.street || '';
    this.event.codePostal = address.postcode || '';
    this.event.ville = address.city || address.town || address.village || '';
    
    this.addressSearchInput = this.addressService.formatSuggestion(suggestion);
    this.showSuggestions = false;
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedImages.push(...files);
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedVideo = input.files[0];
    }
  }

  removeVideo(): void {
    this.selectedVideo = null;
  }

  async onSubmit(form: NgForm) {
    Object.keys(this.formErrors).forEach(key => {
      this.formErrors[key as keyof typeof this.formErrors] = false;
    });

    let hasError = false;
    const requiredFields = ['titre', 'description', 'dateDebut', 'dateFin', 'type'];
    requiredFields.forEach(field => {
      if (!this.event[field as keyof typeof this.event]) {
        this.formErrors[field as keyof typeof this.formErrors] = true;
        hasError = true;
      }
    });

    if (!this.event.numero && !this.event.rue && !this.event.codePostal && !this.event.ville) {
      this.formErrors.adresse = true;
      hasError = true;
    }

    if (hasError) {
      return;
    }
    
    if (form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      try {
        console.log('Images à uploader:', this.selectedImages.map(img => ({ name: img.name, size: img.size })));
        console.log('Vidéo à uploader:', this.selectedVideo ? { 
          name: this.selectedVideo.name, 
          size: this.selectedVideo.size 
        } : null);

        const eventData = {
          titre: this.event.titre,
          description: this.event.description,
          dateDebut: this.event.dateDebut,
          dateFin: this.event.dateFin,
          type: this.event.type,
          adresse: `${this.event.numero} ${this.event.rue}, ${this.event.codePostal} ${this.event.ville}`.trim(),
          placesTotal: this.event.placesTotal || undefined,
          images: [] as string[],
          video: undefined
        };

        const response = await this.evenementService.createEvenement(
          eventData,
          this.selectedImages,
          this.selectedVideo || undefined
        );
        console.log('Événement créé avec succès:', response);
        if (response.evenement) {
          console.log('URLs des images uploadées:', response.evenement.images);
          console.log('URL de la vidéo uploadée:', response.evenement.video);
          this.eventCreated.emit(response.evenement);
          // Réinitialiser le formulaire
          this.resetForm(form);
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        this.errorMessage = 'Une erreur est survenue lors de la création de l\'événement. Veuillez réessayer.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  private resetForm(form: NgForm): void {
    form.resetForm();
    this.event = {
      titre: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      numero: '',
      rue: '',
      codePostal: '',
      ville: '',
      type: '',
      placesTotal: null,
      images: [],
      video: null
    };
    this.selectedImages = [];
    this.selectedVideo = null;
    this.addressSearchInput = '';
    this.showSuggestions = false;
  }
}