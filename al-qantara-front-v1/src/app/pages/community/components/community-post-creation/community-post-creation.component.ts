import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule} from '@angular/forms';
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
      tags: this.fb.array([this.fb.control('', Validators.required)], Validators.required)
    });
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
      this.checkAuthentication();
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('communityId');
      if (id) {
        this.communityId = +id;
        this.checkMembership();
      }
    });
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      confirm('Vous devez être connecté avant de pouvoir interagir avec cette communauté.');
      console.log('User is not authenticated');
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }

  checkMembership() {
    this.communityService.checkIfUserIsMember(this.communityId).subscribe({
      next: (isMember) => {
        this.isMember = isMember;
        if (!isMember) {
          confirm('Vous devez être membre pour créer un post dans cette communauté.');
          this.router.navigate(['communities', this.communityId]);
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

  addTag() {
    this.tags.push(this.fb.control('', Validators.required));
  }

  removeTag(index: number) {
    if (this.tags.length > 1) {
      this.tags.removeAt(index);
    }
  }

  onSubmit(communityId: number) {
    if (this.postForm.valid) {
      this.communityService.createPost(
        communityId,
        this.postForm.value
      ).subscribe({
        next: (res: any) => {
          console.log('Post created successfully:', res);
          this.router.navigate([`/communities/${communityId}`]);
        },
        error: (err: any) => {
          console.error('Error creating post:', err);
          alert('An error occurred while creating the post. Please try again.');

        }
      });
    }
  }
}
