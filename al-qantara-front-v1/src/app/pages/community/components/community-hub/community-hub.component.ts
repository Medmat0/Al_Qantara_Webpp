import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityService } from '../../../../member/services/community.service';
import { CommonModule } from '@angular/common';
import { CommunityPostComponent } from '../community-post/community-post.component';
import { CommunityMembersComponent } from '../community-members/community-members.component';
import { CommunityPostResearchComponent } from '../community-post-research/community-post-research.component';
import { AuthService } from '../../../../member/services/auth.service';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthRequiredModalComponent } from '../../../auth-required-modal/auth-required-modal.component';

@Component({
  selector: 'app-community-hub',
  standalone: true,
  imports: [CommonModule, CommunityPostComponent, CommunityMembersComponent, CommunityPostResearchComponent, ReactiveFormsModule, AuthRequiredModalComponent],
  templateUrl: './community-hub.component.html',
  styleUrl: './community-hub.component.scss'
})
export class CommunityHubComponent implements OnInit {
  communityId!: number;
  community: any = null;
  posts: any[] = [];
  loadingCommunity = true;
  loadingPosts = false;
  error: string | null = null;
  isMember: boolean | null = false;
  userId: number | null = null;
  isAuthenticated: boolean = false;
  isModerator: boolean = false;
  showMembersPopup = false;
  showPostSearchPopup = false;
  showCreateForm = false;
  showAuthModal = false; // Modal d'authentification

  // Formulaire de création de post
  postForm!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  imagePreview: string | null = null;

  page = 1;
  limit = 4;
  allLoaded = false;

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
    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }
      } else {
        this.userId = null;
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('communityId');
      if (id) {
        this.communityId = +id;
        this.posts = [];
        this.page = 1;
        this.allLoaded = false;
        this.fetchCommunity();
        this.fetchPosts();
        if (this.isAuthenticated) {
          this.checkMembership();
          this.communityService.isModerator(this.communityId).subscribe({
            next: (isMod) => this.isModerator = isMod,
            error: () => this.isModerator = false
          });
        } else {
          this.isMember = false;
        }
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const eventTitle = params.get('eventTitle');
      const eventDescription = params.get('eventDescription');
      const link = params.get('link') || '';
      if (eventTitle && eventDescription) {
        this.prefillPostFormWithEvent({
          titre: eventTitle,
          description: eventDescription,
          link: link
        });
        this.showCreateForm = true;
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

    this.postForm.get('pollDeadline')?.setValidators([
      this.pollDeadlineValidator.bind(this)
    ]);
  }

  prefillPostFormWithEvent(event: any) {
    this.postForm.patchValue({
      title: `Regardez cette event: ${event.titre}`,
      description: "Bonjour je vous partage cet événement: " + event.titre
        + "\nDescription: " +event.description + '\n\n' + "Lien: " + event.link +"\n\nVenez nombreux !",
    });
  }

  private pollOptionsValidator(control: AbstractControl): ValidationErrors | null {
    const options = (control.value || []).filter((opt: string) => opt && opt.trim() !== '');
    if (options.length === 1) {
      return { minOptions: true };
    }
    return null;
  }

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

  get tags(): FormArray {
    return this.postForm.get('tags') as FormArray;
  }

  get pollOptions(): FormArray {
    return this.postForm.get('pollOptions') as FormArray;
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.resetForm();
    }
  }

  addTag() {
    if (this.tags.length < 5) {
      this.tags.push(this.fb.control('', Validators.required));
    }
  }

  removeTag(index: number) {
    if (this.tags.length > 1) {
      this.tags.removeAt(index);
    }
  }

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

  onPostTypeChange(event: any) {
    const type = event.target.value;
    this.postForm.patchValue({ type });

    if (type !== 'POLL') {
      this.pollOptions.clear();
    } else {
      if (this.pollOptions.length === 0) {
        this.addPollOption();
        this.addPollOption();
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Formats acceptés : JPEG, PNG, GIF, WebP');
        return;
      }
      this.selectedFile = file;
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
        this.resetForm();
        this.showCreateForm = false;
        this.posts = [];
        this.page = 1;
        this.allLoaded = false;
        this.fetchPosts();
        if (this.community && typeof this.community.nbrPosts === 'number') {
          this.community.nbrPosts++;
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Erreur lors de la création du post';
        this.isSubmitting = false;
      }
    });
  }

  private resetForm() {
    this.postForm.reset();
    this.postForm.patchValue({ type: 'TEXT' });

    while (this.tags.length > 1) {
      this.tags.removeAt(this.tags.length - 1);
    }
    this.tags.at(0).setValue('');

    this.pollOptions.clear();

    this.selectedFile = null;
    this.imagePreview = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

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
      this.showAuthModal = true;
      return false;
    }
    return true;
  }

  onAuthModalClose() {
    this.showAuthModal = false;
  }

  fetchCommunity() {
    this.loadingCommunity = true;
    this.communityService.getCommunityById(this.communityId).subscribe({
      next: (community) => {
        this.community = community;
        this.loadingCommunity = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement de la communauté.';
        this.loadingCommunity = false;
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
    if (this.loadingPosts || this.allLoaded) return;
    this.loadingPosts = true;
    this.error = null;
    this.communityService.getCommunityPosts(this.communityId, { page: this.page, limit: this.limit }).subscribe({
      next: (res) => {
        const newPosts = res?.posts ?? [];
        this.posts = [...this.posts, ...newPosts];
        this.allLoaded = newPosts.length < this.limit;
        this.loadingPosts = false;
        this.page++;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des posts.';
        this.loadingPosts = false;
      }
    });
  }

  onScroll(event: any): void {
    if (this.loadingPosts || this.allLoaded) return;
    const element = event.target;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 100) {
      this.fetchPosts();
    }
  }

  onPostEvent(event: any) {
    if (event?.type === 'deleted') {
      this.posts = this.posts.filter(post => post.id !== event.postId);
      if (this.community && typeof this.community.nbrPosts === 'number' && this.community.nbrPosts > 0) {
        this.community.nbrPosts--;
      }
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
    this.router.navigate([`/communities/${this.communityId}/settings`]);
  }

  goToPostCreation(){
    if (this.checkAuthentication()) {
      this.router.navigate([`/communities/${this.communityId}/posts/create`]);
    }
  }

  goToPost(post: any) {
    this.router.navigate([`/communities/${post.communityId}/posts/${post.id}`]);
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
