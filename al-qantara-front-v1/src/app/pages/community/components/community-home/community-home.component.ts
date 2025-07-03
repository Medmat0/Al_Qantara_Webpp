import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../../member/services/community.service';
import { CommunityPostComponent } from '../community-post/community-post.component';
import { CommunityPropositionsComponent } from '../community-propositions/community-propositions.component';
import { Router, RouterModule } from '@angular/router';
import {AuthService} from '../../../../member/services/auth.service';

@Component({
  selector: 'app-community-home',
  standalone: true,
  imports: [
    CommonModule,
    CommunityPostComponent,
    CommunityPropositionsComponent,
    RouterModule
  ],
  templateUrl: './community-home.component.html',
  styleUrl: './community-home.component.scss'
})
export class CommunityHomeComponent implements OnInit {
  posts: any[] = [];
  loading = true;
  error: string | null = null;
  isModerator: boolean = false; // By default, we do not fetch if moderator in main home
  userId: number | null = null;
  isAuthenticated: boolean = false;

  constructor(
    private communityService: CommunityService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {

    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      console.log('Authentication status:', this.isAuthenticated);
      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }
      } else {
        this.userId = null;
      }
    });

    this.communityService.getRandomPosts().subscribe({
      next: (res) => {
        this.posts = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des posts';
        this.loading = false;
      }
    });
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {

      if(confirm('Vous devez être connecté pour créer une communauté.')){
        this.router.navigate(['auth/login']);
      }
      return false;

    }
    return true;
  }

  onPostEvent(event: any) {
    if (event?.type === 'deleted') {
      this.posts = this.posts.filter(post => post.id !== event.postId);
    }
  }

  onCommunitySelected(community: any) {
    this.router.navigate([`/communities/${community.id}`]);
  }

  goToPost(post: any) {
    // Rediriger vers la page du post
    this.router.navigate([`/communities/${post.communityId}/posts/${post.id}`]);
    console.log('Aller au post:', post);
  }

  goToCreationForm() {
    this.checkAuthentication();
    // Rediriger vers le formulaire de création de post
    this.router.navigate(['/communities/create']);
  }
}
