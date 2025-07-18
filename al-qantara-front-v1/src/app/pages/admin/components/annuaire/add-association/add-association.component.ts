import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AnnuaireService, Association } from '../../../../../services/annuaire.service';
import { AddressService, AddressSuggestion } from '../../../../../member/services/address.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-add-association',
  templateUrl: './add-association.component.html',
  styleUrls: ['./add-association.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AddAssociationComponent implements OnInit {
  
  protected annuaireService = inject(AnnuaireService);
  protected addressService = inject(AddressService);
  protected router = inject(Router);
  
  // Recherche d'adresse
  private searchSubject = new Subject<string>();
  addressSearchInput = '';
  addressSuggestions: AddressSuggestion[] = [];
  showSuggestions = false;
  
  // État du formulaire
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Formulaire association
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

  // Gestion du logo
  selectedLogoFile: File | null = null;
  logoPreviewUrl: string | null = null;

  // Erreurs de validation
  formErrors = {
    nom: false,
    description: false,
    email: false,
    secteurActivite: false,
    ville: false,
    region: false
  };

  // Secteurs d'activité prédéfinis
  secteursActivite = [
    'Culturel',
    'Social',
    'Éducatif',
    'Sportif',
    'Religieux',
    'Humanitaire',
    'Économique',
    'Environnemental',
    'Santé',
    'Jeunesse',
    'Femmes',
    'Seniors',
    'Autre'
  ];

  // Régions françaises
  regionsFrancaises = [
    'Auvergne-Rhône-Alpes',
    'Bourgogne-Franche-Comté',
    'Bretagne',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Hauts-de-France',
    'Île-de-France',
    'Normandie',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Pays de la Loire',
    'Provence-Alpes-Côte d\'Azur'
  ];

  constructor() {
    // Configuration de la recherche d'adresse avec debounce
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => this.addressService.searchAddress(query))
    ).subscribe(suggestions => {
      this.addressSuggestions = suggestions;
      this.showSuggestions = suggestions.length > 0;
    });
  }

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  // Gestion des dates pour les formulaires HTML
  get dateCreationString(): string {
    return this.association.dateCreation ? 
      this.association.dateCreation instanceof Date ? 
        this.association.dateCreation.toISOString().split('T')[0] :
        new Date(this.association.dateCreation).toISOString().split('T')[0]
      : '';
  }

  set dateCreationString(value: string) {
    this.association.dateCreation = value ? new Date(value) : undefined;
  }

  // Recherche d'adresse
  onAddressSearch(value: string): void {
    this.addressSearchInput = value;
    this.searchSubject.next(value);
  }

  handleAddressSelect(suggestion: AddressSuggestion): void {
    const address = suggestion.address;
    
    // Construire l'adresse complète
    const numeroRue = [
      address.house_number || '',
      address.road || address.street || ''
    ].filter(Boolean).join(' ');
    
    this.association.adresse = numeroRue;
    this.association.codePostal = address.postcode || '';
    this.association.ville = address.city || address.town || address.village || '';
    
    // Déterminer la région à partir du département
    const region = this.determineRegionFromAddress(address);
    if (region) {
      this.association.region = region;
    }

    this.addressSearchInput = this.addressService.formatSuggestion(suggestion);
    this.showSuggestions = false;
  }

  private determineRegionFromAddress(address: any): string | null {
    const codePostal = address.postcode;
    if (!codePostal) return null;
    
    const departement = codePostal.substring(0, 2);
    
    const deptToRegion: { [key: string]: string } = {
      '75': 'Île-de-France', '77': 'Île-de-France', '78': 'Île-de-France', '91': 'Île-de-France',
      '92': 'Île-de-France', '93': 'Île-de-France', '94': 'Île-de-France', '95': 'Île-de-France',
      '13': 'Provence-Alpes-Côte d\'Azur', '83': 'Provence-Alpes-Côte d\'Azur', '84': 'Provence-Alpes-Côte d\'Azur',
      '69': 'Auvergne-Rhône-Alpes', '01': 'Auvergne-Rhône-Alpes', '07': 'Auvergne-Rhône-Alpes',
      '59': 'Hauts-de-France', '62': 'Hauts-de-France', '80': 'Hauts-de-France',
    };
    
    return deptToRegion[departement] || null;
  }

  // Validation
  validateForm(): boolean {
    this.resetFormErrors();
    let isValid = true;

    if (!this.association.nom?.trim()) {
      this.formErrors.nom = true;
      isValid = false;
    }

    if (!this.association.description?.trim()) {
      this.formErrors.description = true;
      isValid = false;
    }

    if (!this.association.secteurActivite) {
      this.formErrors.secteurActivite = true;
      isValid = false;
    }

    if (!this.association.ville?.trim()) {
      this.formErrors.ville = true;
      isValid = false;
    }

    if (!this.association.region) {
      this.formErrors.region = true;
      isValid = false;
    }

    if (this.association.email && !this.isValidEmail(this.association.email)) {
      this.formErrors.email = true;
      isValid = false;
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetFormErrors(): void {
    Object.keys(this.formErrors).forEach(key => {
      this.formErrors[key as keyof typeof this.formErrors] = false;
    });
  }

  // Soumission
  async onSubmit(form: NgForm): Promise<void> {
    if (!this.validateForm() || this.isSubmitting) {
      this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    try {
      // Nettoyer les données de l'association en retirant les champs vides
      const cleanedAssociation: any = {};
      
      Object.keys(this.association).forEach(key => {
        const value = this.association[key as keyof Association];
        if (value !== undefined && value !== null && value !== '') {
          cleanedAssociation[key] = value;
        }
      });


      // Utiliser la même méthode que community : passer le fichier directement
      const response = await this.annuaireService.creerAssociation(cleanedAssociation, this.selectedLogoFile || undefined).toPromise();
      this.successMessage = response?.message || 'Association créée avec succès!';
      
      // Rediriger vers la liste après 2 secondes
      setTimeout(() => {
        this.router.navigate(['/admin/annuaire']);
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      this.errorMessage = error.error?.message || 'Erreur lors de la création de l\'association';
    } finally {
      this.isSubmitting = false;
    }
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/admin/annuaire']);
  }

  // Utilitaires
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Gestion du logo
  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validation simple
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Veuillez sélectionner un fichier image valide';
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB max
        this.errorMessage = 'Le fichier est trop volumineux (max 5MB)';
        return;
      }

      this.selectedLogoFile = file;
      this.clearMessages();

      // Générer l'aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreviewUrl = null;
    this.association.logo = '';
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById('logo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
