import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AnnuaireService, Association } from '../../../../../services/annuaire.service';
import { AddressService, AddressSuggestion } from '../../../../../member/services/address.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-edit-association',
  templateUrl: './edit-association.component.html',
  styleUrls: ['./edit-association.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditAssociationComponent implements OnInit {

  @Input() associationToEdit: Association | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() associationUpdated = new EventEmitter<Association>();

  protected annuaireService = inject(AnnuaireService);
  protected addressService = inject(AddressService);

  private searchSubject = new Subject<string>();
  addressSearchInput = '';
  addressSuggestions: AddressSuggestion[] = [];
  showSuggestions = false;

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  association: Partial<Association> = {
    nom: '',
    description: '',
    secteurActivite: '',
    adresse: '',
    ville: '',
    codePostal: '',
    region: '',
    telephone: '',
    email: '',
    siteWeb: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    numeroRNA: '',
    numeroSIRET: '',
    dateCreation: undefined,
    logo: ''
  };

  formErrors: Record<string, boolean> = {};

  selectedLogoFile: File | null = null;
  logoPreviewUrl: string | null = null;

  dateCreationString = '';

  secteursActivite: string[] = [
    'Éducation et Formation',
    'Santé et Social',
    'Culture et Arts',
    'Sport et Loisirs',
    'Économie et Entrepreneuriat',
    'Droits et Citoyenneté',
    'Environnement',
    'Jeunesse',
    'Femmes',
    'Solidarité internationale',
    'Religion et Spiritualité',
    'Autre'
  ];

  regionsFrancaises: string[] = [
    'Île-de-France',
    'Auvergne-Rhône-Alpes',
    'Hauts-de-France',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Grand Est',
    'Provence-Alpes-Côte d\'Azur',
    'Normandie',
    'Bourgogne-Franche-Comté',
    'Pays de la Loire',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse'
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.setupAddressSearch();
  }

  private initializeForm(): void {
    if (this.associationToEdit) {
      this.association = { ...this.associationToEdit };

      if (this.association.dateCreation) {
        const date = new Date(this.association.dateCreation);
        this.dateCreationString = date.toISOString().split('T')[0];
      }

      if (this.association.logo) {
        this.logoPreviewUrl = this.association.logo;
      }
    }
  }

  private setupAddressSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.length < 3) {
            return of([]);
          }
          return this.addressService.searchAddress(query, 'fr');
        })
      )
      .subscribe({
        next: (suggestions) => {
          this.addressSuggestions = suggestions;
          this.showSuggestions = suggestions.length > 0;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche d\'adresse:', error);
          this.addressSuggestions = [];
          this.showSuggestions = false;
        }
      });
  }

  onAddressSearch(query: string): void {
    this.searchSubject.next(query);
  }

  handleAddressSelect(suggestion: AddressSuggestion): void {
    this.association.adresse = this.addressService.formatSuggestion(suggestion);
    this.association.ville = suggestion.address.city || suggestion.address.town || '';
    this.association.codePostal = suggestion.address.postcode || '';

    const regionFromPostcode = this.getRegionFromPostcode(this.association.codePostal);
    if (regionFromPostcode) {
      this.association.region = regionFromPostcode;
    }

    this.addressSearchInput = '';
    this.showSuggestions = false;
    this.addressSuggestions = [];
  }

  private getRegionFromPostcode(postcode: string): string | null {
    if (!postcode) return null;

    const code = parseInt(postcode.substring(0, 2));

    if (code >= 75 && code <= 77 || code === 91 || code === 92 || code === 93 || code === 94 || code === 95) {
      return 'Île-de-France';
    } else if (code >= 1 && code <= 3 || code >= 15 && code <= 15 || code >= 43 && code <= 43 || code >= 63 && code <= 63 || code >= 69 && code <= 69 || code >= 73 && code <= 74) {
      return 'Auvergne-Rhône-Alpes';
    } else if (code >= 59 && code <= 62 || code === 80 || code === 2) {
      return 'Hauts-de-France';
    } else if (code >= 16 && code <= 17 || code >= 19 && code <= 19 || code >= 23 && code <= 23 || code >= 24 && code <= 24 || code >= 33 && code <= 33 || code >= 40 && code <= 40 || code >= 47 && code <= 47 || code >= 64 && code <= 64 || code >= 79 && code <= 79 || code >= 86 && code <= 87) {
      return 'Nouvelle-Aquitaine';
    }

    return null;
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Le fichier logo ne peut pas dépasser 5MB';
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Le logo doit être une image (JPG, PNG, GIF)';
        return;
      }

      this.selectedLogoFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      this.errorMessage = '';
    }
  }

  removeLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreviewUrl = null;
    this.association.logo = '';

    const fileInput = document.getElementById('logo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.association.nom || this.association.nom.trim() === '') {
      this.formErrors['nom'] = true;
      isValid = false;
    }

    if (!this.association.description || this.association.description.trim() === '') {
      this.formErrors['description'] = true;
      isValid = false;
    }

    if (!this.association.secteurActivite) {
      this.formErrors['secteurActivite'] = true;
      isValid = false;
    }

    if (!this.association.ville || this.association.ville.trim() === '') {
      this.formErrors['ville'] = true;
      isValid = false;
    }

    if (!this.association.region) {
      this.formErrors['region'] = true;
      isValid = false;
    }

    // Validation de l'email si fourni
    if (this.association.email && this.association.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.association.email)) {
        this.formErrors['email'] = true;
        isValid = false;
      }
    }

    return isValid;
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (!this.validateForm()) {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Préparer les données à envoyer
      const updateData: Partial<Association> = { ...this.association };

      if (this.dateCreationString) {
        const date = new Date(this.dateCreationString);
        updateData.dateCreation = date;
      }

      if (this.associationToEdit?.id) {
        const response = await this.annuaireService.modifierAssociation(this.associationToEdit.id, updateData).toPromise();

        this.successMessage = 'Association mise à jour avec succès!';

        if (response?.association) {
          this.associationUpdated.emit(response.association);
        }

        setTimeout(() => {
          this.closeModal.emit();
        }, 1500);
      }

    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la mise à jour';
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.closeModal.emit();
  }
}
