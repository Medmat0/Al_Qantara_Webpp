import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityService } from '../../../../member/services/community.service';
import { CommonModule } from '@angular/common';
import { CommunityPostComponent } from '../community-post/community-post.component';

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

  constructor(private route: ActivatedRoute, private communityService: CommunityService, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('communityId');
      if (id) {
        this.communityId = +id;
        this.fetchCommunity();
        this.fetchPosts();
      }
    });
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
}
