import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../../member/services/community.service';
import { CommunityPostComponent } from '../community-post/community-post.component';
import { CommunityPropositionsComponent } from '../community-propositions/community-propositions.component';
import { Router, RouterModule } from '@angular/router';

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

  constructor(private communityService: CommunityService, private router: Router) {}

  ngOnInit() {
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

  onPostEvent(event: any) {

  }

  onCommunitySelected(community: any) {
    this.router.navigate([`/communities/${community.id}`]);
  }

  goToPost(post: any) {
    // Rediriger vers la page du post
    this.router.navigate([`/communities/${post.communityId}/posts/${post.id}`]);
    console.log('Aller au post:', post);
  }
}
