import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityService } from '../../../../member/services/community.service';
import { CommonModule } from '@angular/common';
import { CommunityPostComponent } from '../community-post/community-post.component';
import {AuthService} from '../../../../member/services/auth.service';

@Component({
  selector: 'app-community-hub',
  standalone: true,
  imports: [CommonModule, CommunityPostComponent],
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

  constructor(
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private router: Router,
    private authService: AuthService
    ) {}

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
        this.fetchCommunity();
        this.fetchPosts();
      }
    });
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      confirm('Vous devez être connecté pour interagir avec cette communauté.');
      this.router.navigate(['auth/login']);
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
        this.checkMembership();
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
    // Traiter les événements des posts ici (like, commentaire, etc.)
    console.log('Post event:', event);
  }

   goToPost(post: any) {
    // Rediriger vers la page du post
    this.router.navigate([`/communities/${post.communityId}/posts/${post.id}`]);
    console.log('Aller au post:', post);
  }

  joinCommunity() {
    this.checkAuthentication();
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
    this.checkAuthentication();
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
}
