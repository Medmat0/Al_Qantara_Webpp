import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminGuidesService, Guide, PointInteret, TypePointInteret } from '../../../../admin/services/admin-guides.service';
import { AuthService } from '../../../../member/services/auth.service';
import { AddressService, AddressSuggestion } from '../../../../member/services/address.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs';
import { Utilisateur } from '../../../../member/models/utilisateur';

@Component({
  selector: 'app-guide-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './guide-form.component.html',
  styleUrls: ['./guide-form.component.scss']
})
export class GuideFormComponent implements OnInit {
  guideForm: FormGroup;
  isEditMode = false;
  guideId: number | null = null;
  submitting = false;
  currentUser: Utilisateur | null = null;
  isAuthenticated = false;
  errorMessage = ''; // Add error message property
  
  mainImageFile: File | null = null;
  mainImagePreview: string | null = null;
  galleryImageFiles: File[] = [];
  galleryImagesPreviews: string[] = [];

  // Address search properties
  protected addressService = inject(AddressService);
  private searchSubject = new Subject<string>();
  addressSearchInput = '';
  addressSuggestions: AddressSuggestion[] = [];
  showSuggestions = false;
  
  // POI address search properties
  poiAddressSearchInputs: string[] = [];
  poiAddressSuggestions: AddressSuggestion[][] = [];
  showPoiSuggestions: boolean[] = [];
  private poiSearchSubjects: Subject<{query: string, index: number}>[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private guidesService: AdminGuidesService,
    private authService: AuthService
  ) {
    this.guideForm = this.createForm();
    
    // Initialize arrays
    this.poiAddressSearchInputs = [];
    this.poiAddressSuggestions = [];
    this.showPoiSuggestions = [];
    this.poiSearchSubjects = [];
    
    // Setup address search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => this.addressService.searchAddress(query))
    ).subscribe(suggestions => {
      this.addressSuggestions = suggestions;
      this.showSuggestions = suggestions.length > 0;
    });
  }

  ngOnInit() {
    this.checkAuthStatus();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.guideId = +params['id'];
        this.loadGuide();
      }
    });
  }

  checkAuthStatus() {
    const userStr = localStorage.getItem('utilisateur');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.isAuthenticated = true;
      
      // Check if user is admin
      if (this.currentUser?.role !== 'ADMIN') {
        console.error('Access denied: Admin role required');
        this.router.navigate(['/']);
        return;
      }
    } else {
      // Check auth status from server
      this.authService.checkAuthStatus().subscribe({
        next: (response) => {
          if (response.authenticated && response.utilisateur?.role === 'ADMIN') {
            this.currentUser = response.utilisateur;
            this.isAuthenticated = true;
          } else {
            console.error('Access denied: Admin authentication required');
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Authentication check failed:', error);
          this.router.navigate(['/']);
        }
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', Validators.required],
      region: ['', Validators.required],
      description: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      pointsInteret: this.fb.array([])
    });
  }

  get pointsInteretArray() {
    return this.guideForm.get('pointsInteret') as FormArray;
  }

  createPointInteretForm(): FormGroup {
    return this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      adresse: ['', Validators.required],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      horairesOuverture: [''],
      tarifs: [''],
      telephone: [''],
      siteWeb: [''],
      typePoint: ['AUTRE']
    });
  }

  // Address search methods
  onAddressSearch(value: string): void {
    this.addressSearchInput = value;
    this.searchSubject.next(value);
  }

  handleAddressSelect(suggestion: AddressSuggestion): void {
    const address = suggestion.address;
    const formattedAddress = this.addressService.formatSuggestion(suggestion);
    
    // Update main guide region and coordinates
    this.guideForm.patchValue({
      region: address.city || address.town || address.village || address.state || ''
    });

    // If coordinates are available, update them
    if (suggestion.lat && suggestion.lon) {
      this.guideForm.patchValue({
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon)
      });
    }

    this.addressSearchInput = formattedAddress;
    this.showSuggestions = false;
  }

  onPointInteretAddressSearch(value: string, index: number): void {
    // For POI address search, we could implement a similar system
    // For now, we'll keep it simple
  }

  addPointInteret() {
    const index = this.pointsInteretArray.length;
    this.pointsInteretArray.push(this.createPointInteretForm());
    
    // Initialize address search for this POI
    this.initializePoiAddressSearch(index);
  }

  removePointInteret(index: number) {
    this.pointsInteretArray.removeAt(index);
    
    // Clean up address search arrays
    this.poiAddressSearchInputs.splice(index, 1);
    this.poiAddressSuggestions.splice(index, 1);
    this.showPoiSuggestions.splice(index, 1);
    if (this.poiSearchSubjects[index]) {
      this.poiSearchSubjects[index].complete();
      this.poiSearchSubjects.splice(index, 1);
    }
  }

  private initializePoiAddressSearch(index: number) {
    // Ensure arrays are large enough
    while (this.poiAddressSearchInputs.length <= index) {
      this.poiAddressSearchInputs.push('');
      this.poiAddressSuggestions.push([]);
      this.showPoiSuggestions.push(false);
    }
    
    // Initialize for this specific index
    this.poiAddressSearchInputs[index] = '';
    this.poiAddressSuggestions[index] = [];
    this.showPoiSuggestions[index] = false;
    
    // Create search subject for this POI if it doesn't exist
    if (!this.poiSearchSubjects[index]) {
      const subject = new Subject<{query: string, index: number}>();
      this.poiSearchSubjects[index] = subject;
      
      subject.pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => prev.query === curr.query),
        switchMap(({query, index}) => 
          this.addressService.searchAddress(query).pipe(
            map((suggestions: AddressSuggestion[]) => ({suggestions, index}))
          )
        )
      ).subscribe(({suggestions, index}: {suggestions: AddressSuggestion[], index: number}) => {
        this.poiAddressSuggestions[index] = suggestions;
        this.showPoiSuggestions[index] = suggestions.length > 0;
      });
    }
  }

  onPoiAddressSearch(value: string, index: number): void {
    // Ensure the index exists in our arrays
    if (index >= this.poiAddressSearchInputs.length) {
      this.initializePoiAddressSearch(index);
    }
    
    this.poiAddressSearchInputs[index] = value;
    if (this.poiSearchSubjects[index]) {
      this.poiSearchSubjects[index].next({query: value, index});
    }
  }

  handlePoiAddressSelect(suggestion: AddressSuggestion, index: number): void {
    const address = suggestion.address;
    const formattedAddress = this.addressService.formatSuggestion(suggestion);
    
    // Update POI address form control
    const pointControl = this.pointsInteretArray.at(index);
    const updateData: any = {
      adresse: formattedAddress
    };

    // If coordinates are available, update them
    if (suggestion.lat && suggestion.lon) {
      updateData.latitude = parseFloat(suggestion.lat);
      updateData.longitude = parseFloat(suggestion.lon);
    }

    pointControl.patchValue(updateData);

    this.poiAddressSearchInputs[index] = formattedAddress;
    this.showPoiSuggestions[index] = false;
  }

  loadGuide() {
    if (!this.guideId) return;

    this.guidesService.getGuideById(this.guideId).subscribe({
      next: (response) => {
        if (response.success) {
          const guide = response.data;
          this.guideForm.patchValue({
            nom: guide.nom,
            region: guide.region,
            description: guide.description,
            latitude: guide.latitude,
            longitude: guide.longitude
          });

          // Charger l'image principale
          if (guide.image) {
            this.mainImagePreview = guide.image;
          }

          // Charger les images de galerie
          this.galleryImagesPreviews = [...guide.images];

          // Charger les points d'intérêt
          guide.pointsInteret.forEach((point, index) => {
            const pointForm = this.createPointInteretForm();
            pointForm.patchValue(point);
            this.pointsInteretArray.push(pointForm);
            
            // Initialize address search for this POI
            this.initializePoiAddressSearch(index);
          });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement du guide:', error);
      }
    });
  }

  onMainImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.mainImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.mainImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onGalleryImagesChange(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.galleryImageFiles = files;
    
    this.galleryImagesPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.galleryImagesPreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removeMainImage() {
    this.mainImageFile = null;
    this.mainImagePreview = null;
  }

  removeGalleryImage(index: number) {
    this.galleryImageFiles.splice(index, 1);
    this.galleryImagesPreviews.splice(index, 1);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.guideForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.guideForm.invalid) {
      this.markFormGroupTouched(this.guideForm);
      return;
    }

    this.submitting = true;
    const formData = this.guidesService.createGuideFormData(
      this.guideForm.value,
      this.mainImageFile || undefined,
      this.galleryImageFiles.length > 0 ? this.galleryImageFiles : undefined
    );

    const request = this.isEditMode && this.guideId
      ? this.guidesService.updateGuide(this.guideId, formData)
      : this.guidesService.createGuide(formData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/admin/guides']);
        }
        this.submitting = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'enregistrement:', error);
        
        // Better error handling
        if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          // Clear localStorage and redirect to login
          localStorage.removeItem('utilisateur');
          this.isAuthenticated = false;
          this.router.navigate(['/']);
        } else if (error.status === 403) {
          this.errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement.';
        }
        
        this.submitting = false;
        
        // Clear error message after 10 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 10000);
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/guides']);
  }
}
