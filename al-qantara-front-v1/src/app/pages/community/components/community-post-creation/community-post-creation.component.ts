import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, AbstractControl} from '@angular/forms';
import {CommunityService} from '../../../../member/services/community.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../../member/services/auth.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-community-post-creation',
  templateUrl: './community-post-creation.component.html',
  styleUrl: './community-post-creation.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ]
})
export class CommunityPostCreationComponent implements OnInit{
  postForm: FormGroup;
  communityId!: number;
  isMember: boolean | null = false;
  userId: number | null = null;
  isAuthenticated: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private communityService: CommunityService,
    private router: Router,
    private authService: AuthService
  ) {
    this.postForm = this.fb.group({
      titre: ['', Validators.required],
      contenu: ['', Validators.required],
      tags: this.fb.array([this.fb.control('')], this.atLeastOneTag),
      pollOptions: this.fb.array([]),
      pollDeadline: ['']
    });
  }
  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const id = params.get('communityId');
      if (id) {
        this.communityId = +id;
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
          this.checkAuthentication();
        });
      }
    });
    this.postForm.get('pollOptions')?.setValidators([
      (control: AbstractControl) => {
        // Si aucune option de sondage n'est renseignée, pas d'erreur
        const filledOptions = control.value?.filter((v: string) => v && v.trim() !== '');
        if (!filledOptions || filledOptions.length === 0) return null;
        // Si une seule option renseignée, erreur
        if (filledOptions.length === 1) return { minOptions: true };
        return null;
      }
    ]);

    this.postForm.get('pollDeadline')?.setValidators([
      (control: AbstractControl) => {
        const pollOptionsArr = this.pollOptions.controls.map(opt => opt.value).filter((v: string) => v && v.trim() !== '');
        if (pollOptionsArr.length > 1) {
          if (!control.value) {
            return { requiredIfPoll: true };
          }
          const today = new Date();
          const selected = new Date(control.value);
          // On compare seulement la date (pas l'heure)
          today.setHours(0,0,0,0);
          selected.setHours(0,0,0,0);
          if (selected <= today) {
            return { minDate: true };
          }
        }
        return null;
      }
    ]);

    // Force update validity when tags or pollOptions change
    this.tags.valueChanges.subscribe(() => {
      this.tags.updateValueAndValidity({ onlySelf: true });
      this.postForm.updateValueAndValidity();
    });
    this.pollOptions.valueChanges.subscribe(() => {
      this.pollOptions.updateValueAndValidity({ onlySelf: true });
      this.postForm.updateValueAndValidity();
    });
  }

  // Custom validator: au moins un tag non vide
  atLeastOneTag(formArray: AbstractControl) {
    const arr = (formArray as FormArray).controls;
    return arr.some(control => control.value && control.value.trim() !== '') ? null : { atLeastOneTag: true };
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {

      if(confirm('Vous devez être connecté pour interagir avec cette communauté.')){
        this.router.navigate(['auth/login']);
      }
      return false;

    }
    this.checkMembership();
    return true;
  }

  checkMembership() {
    this.communityService.checkIfUserIsMember(this.communityId).subscribe({
      next: (isMember) => {
        this.isMember = isMember;
        if (!isMember) {
          confirm('Vous devez être membre pour interagir avec cette communauté.');
          this.router.navigate(['/communities', this.communityId]);

        }
      },
      error: () => {
        this.isMember = false;
        confirm('Erreur lors de la vérification du statut de membre.');
        this.router.navigate(['auth/login']);
      }
    });
  }

  get tags() {
    return this.postForm.get('tags') as FormArray;
  }

  get pollOptions() {
    return this.postForm.get('pollOptions') as FormArray;
  }

  addTag() {
    this.tags.push(this.fb.control(''));
  }

  removeTag(index: number) {
    if (this.tags.length > 1) {
      this.tags.removeAt(index);
    }
  }

  addPollOption() {
    this.pollOptions.push(this.fb.control(''));
    this.postForm.get('pollDeadline')?.markAsTouched();
    this.postForm.get('pollDeadline')?.updateValueAndValidity();
  }

  removePollOption(index: number) {
    this.pollOptions.removeAt(index);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Générer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

  onSubmit(communityId: number) {
    const tags = this.tags.controls.map(control => control.value).filter((tag: string) => tag && tag.trim() !== '');
    const pollOptions = this.pollOptions.controls.map(control => control.value).filter((opt: string) => opt && opt.trim() !== '');

    const data = {
      titre: this.postForm.get('titre')?.value,
      contenu: this.postForm.get('contenu')?.value,
      tags: tags,
      pollOptions: pollOptions,
      pollDeadline: this.postForm.get('pollDeadline')?.value,
      img: this.selectedFile
    };
    console.log('Form Data:', data);

    this.communityService.createPost(communityId, data).subscribe({
      next: (res: any) => {
        console.log('Post created successfully:', res);
        this.router.navigate([`/communities/${communityId}`]);
      },
      error: (err: any) => {
        console.error('Error creating post:', err);
        alert('Une erreur est survenue lors de la création du post. Veuillez réessayer.');
      }
    });
  }
}
