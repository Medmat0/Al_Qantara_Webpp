import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityService } from '../../../../member/services/community.service';
import { CommonModule } from '@angular/common';
import { CommunityPostComponent } from '../community-post/community-post.component';
import { CommunityMembersComponent } from '../community-members/community-members.component';
import { CommunityPostResearchComponent } from '../community-post-research/community-post-research.component';
import { AuthService } from '../../../../member/services/auth.service';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-community-hub',
  standalone: true,
  imports: [CommonModule, CommunityPostComponent, CommunityMembersComponent, CommunityPostResearchComponent, ReactiveFormsModule],
  templateUrl: './community-hub.component.html',
  styleUrl: './community-hub.component.scss'
})
export class CommunityHubComponent implements OnInit {
  communityId!: number;
  community: any = null;
  posts: any[] = [];
  loading = true;
  error: string | null = null;
  isMember: boolean | null = false;
  userId: number | null = null;
  isAuthenticated: boolean = false;
  isModerator: boolean = false;
  showMembersPopup = false;
  showPostSearchPopup = false;
  showCreateForm = false;

  // Formulaire de création de post
  postForm!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  imagePreview: string | null = null;

  openPostSearchPopup() {
    this.showPostSearchPopup = true;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px';
  }

  closePostSearchPopup() {
    this.showPostSearchPopup = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  constructor(
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initPostForm();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('communityId');
      if (id) {
        this.communityId = +id;
        this.fetchCommunity();
        this.fetchPosts();
      }
    });

    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      console.log('Authentication status:', this.isAuthenticated);

      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }

        if (this.communityId) {
          this.checkMembership();
          this.communityService.isModerator(this.communityId).subscribe({
            next: (isMod) => this.isModerator = isMod,
            error: () => this.isModerator = false
          });
        }
      } else {
        this.userId = null;
        this.isMember = false;
        this.isModerator = false;
      }
    });
  }

  // Initialisation du formulaire de création de post
  private initPostForm() {
    this.postForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      type: ['TEXT', Validators.required],
      tags: this.fb.array(
        [this.fb.control('', Validators.required)],
        { validators: [this.atLeastOneTagValidator] }
      ),
      pollOptions: this.fb.array([], [this.pollOptionsValidator]),
      pollDeadline: ['']
    });

    // Ajoute la validation de la date limite après l'init
    this.postForm.get('pollDeadline')?.setValidators([
      this.pollDeadlineValidator.bind(this)
    ]);
  }

  // Validator pour pollOptions
  private pollOptionsValidator(control: AbstractControl): ValidationErrors | null {
    const options = (control.value || []).filter((opt: string) => opt && opt.trim() !== '');
    if (options.length === 1) {
      return { minOptions: true };
    }
    return null;
  }

  // Validator pour pollDeadline
  private pollDeadlineValidator(control: AbstractControl): ValidationErrors | null {
    const pollOptions = this.postForm?.get('pollOptions')?.value || [];
    const hasPoll = pollOptions.filter((opt: string) => opt && opt.trim() !== '').length > 0;
    const value = control.value;
    if (hasPoll) {
      if (!value) {
        return { requiredIfPoll: true };
      }
      const today = new Date();
      today.setHours(0,0,0,0);
      const selected = new Date(value);
      if (selected <= today) {
        return { minDate: true };
      }
    }
    return null;
  }

  private atLeastOneTagValidator(control: AbstractControl): ValidationErrors | null {
    const tags = (control.value || []).map((t: string) => t && t.trim());
    const hasTag = tags.some((t: string) => !!t);
    return hasTag ? null : { atLeastOneTag: true };
  }

  get tagsTouched(): boolean {
    return this.tags.touched;
  }

  // Getters pour les FormArrays
  get tags(): FormArray {
    return this.postForm.get('tags') as FormArray;
  }

  get pollOptions(): FormArray {
    return this.postForm.get('pollOptions') as FormArray;
  }

  // Toggle du formulaire de création
  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.resetForm();
    }
  }

  // Gestion des tags
  addTag() {
    if (this.tags.length < 5) { // Limite à 5 tags
      this.tags.push(this.fb.control('', Validators.required));
    }
  }

  removeTag(index: number) {
    if (this.tags.length > 1) {
      this.tags.removeAt(index);
    }
  }

  // Gestion des options de sondage
  addPollOption() {
    if (this.pollOptions.length < 6) {
      this.pollOptions.push(this.fb.control('', Validators.required));
      this.postForm.get('pollDeadline')?.markAsTouched();
      this.postForm.get('pollDeadline')?.updateValueAndValidity();
    }
  }

  removePollOption(index: number) {
    if (this.pollOptions.length > 1) {
      this.pollOptions.removeAt(index);
      this.postForm.get('pollDeadline')?.markAsTouched();
      this.postForm.get('pollDeadline')?.updateValueAndValidity();
    }
  }

  // Gestion du type de post
  onPostTypeChange(event: any) {
    const type = event.target.value;
    this.postForm.patchValue({ type });

    // Reset poll options si ce n'est pas un sondage
    if (type !== 'POLL') {
      this.pollOptions.clear();
    } else {
      // Ajouter 2 options par défaut pour un sondage
      if (this.pollOptions.length === 0) {
        this.addPollOption();
        this.addPollOption();
      }
    }
  }

  // Gestion de la sélection de fichier
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 5MB');
        return;
      }
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Formats acceptés : JPEG, PNG, GIF, WebP');
        return;
      }
      this.selectedFile = file;
      // Générer l'aperçu
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

  // Soumission du formulaire
  onSubmit(communityId: number) {
    if (!this.checkAuthentication()) {
      return;
    }

    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      return;
    }

    this.isSubmitting = true;

    
    const tags = this.tags.value.filter((tag: string) => tag.trim() !== '');
    const pollOptions = this.pollOptions.value.filter((option: string) => option.trim() !== '');
    const type = pollOptions.length >= 2 ? 'POLL' : 'TEXT';


    const data = {
      titre: this.postForm.get('title')?.value,
      contenu: this.postForm.get('description')?.value,
      tags: tags,
      pollOptions: type === 'POLL' ? pollOptions : [],
      pollDeadline: type === 'POLL' ? (this.postForm.get('pollDeadline')?.value || null) : null,
      img: this.selectedFile,
      type: type
    };

    this.communityService.createPost(communityId, data).subscribe({
      next: (response) => {
        console.log('Post créé avec succès:', response);
        this.resetForm();
        this.showCreateForm = false;
        this.fetchPosts();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création du post:', error);
        this.error = error.error?.message || 'Erreur lors de la création du post';
        this.isSubmitting = false;
      }
    });
  }

  // Réinitialiser le formulaire
  private resetForm() {
    this.postForm.reset();
    this.postForm.patchValue({ type: 'TEXT' });

    // Reset des tags
    while (this.tags.length > 1) {
      this.tags.removeAt(this.tags.length - 1);
    }
    this.tags.at(0).setValue('');

    // Reset des options de sondage
    this.pollOptions.clear();

    // Reset du fichier et de l'aperçu
    this.selectedFile = null;
    this.imagePreview = null;
    // Reset de l'input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          } else {
            ctrl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Méthodes utilitaires pour le template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.postForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['minlength']) return `${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
    }
    return '';
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {

      if(confirm('Vous devez être connecté pour interagir avec cette communauté.')){
        this.router.navigate(['auth/login']);
      }
      return false;

    }
    return true;
  }

  fetchCommunity() {
    this.loading = true;
    this.communityService.getCommunityById(this.communityId).subscribe({
      next: (community) => {
        this.community = community;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement de la communauté.';
        this.loading = false;

      }
    });
  }

  checkMembership() {
    this.communityService.checkIfUserIsMember(this.communityId).subscribe({
      next: (isMember) => {
        this.isMember = isMember;
      },
      error: () => {
        this.isMember = false;
      }
    });
  }

  fetchPosts() {
    this.communityService.getCommunityPosts(this.communityId).subscribe({
      next: (res) => {
        this.posts = res.posts || [];
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des posts.';
      }
    });
  }



  onPostEvent(event: any) {
    if (event?.type === 'deleted') {
      this.posts = this.posts.filter(post => post.id !== event.postId);
    }
  }

  openMembersPopup() {
    this.showMembersPopup = true;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px';
  }

  closeMembersPopup() {
    this.showMembersPopup = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  goToSettings() {
    // Rediriger vers la page des paramètres de la communauté
    this.router.navigate([`/communities/${this.communityId}/settings`]);
  }

  goToPostCreation(){
    if (this.checkAuthentication()) {
      this.router.navigate([`/communities/${this.communityId}/posts/create`]);
    }
  }

   goToPost(post: any) {
    // Rediriger vers la page du post
    this.router.navigate([`/communities/${post.communityId}/posts/${post.id}`]);
    console.log('Aller au post:', post);
  }

  joinCommunity() {
    this.communityService.joinCommunity(this.communityId).subscribe({
      next: () => {
        this.isMember = true;
        this.fetchCommunity();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'adhésion à la communauté.';
      }
    });
  }

  leaveCommunity() {
    this.communityService.leaveCommunity(this.communityId).subscribe({
      next: () => {
        this.isMember = false;
        this.fetchCommunity();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du départ de la communauté.';
      }
    });
  }
    trackByPostId(index: number, post: any): any {
    return post.id;
  }

  goToCommunityHome() {
    this.router.navigate(['/communities']);
  }
}
