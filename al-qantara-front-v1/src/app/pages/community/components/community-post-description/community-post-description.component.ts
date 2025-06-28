import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunityService } from '../../../../member/services/community.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community-post-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-post-description.component.html',
  styleUrl: './community-post-description.component.scss'
})
export class CommunityPostDescriptionComponent implements OnInit {
  communityId!: number;
  postId!: number;
  post: any = null;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private communityService: CommunityService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const communityId = params.get('communityId');
      const postId = params.get('postId');
      if (communityId && postId) {
        this.communityId = +communityId;
        this.postId = +postId;
        this.fetchPost();
      }
    });
  }

  fetchPost() {
    this.loading = true;
    this.communityService.getCommunityPostById(this.communityId, this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement du post.';
        this.loading = false;
      }
    });
  }

  likePost() {
    if (this.post) {
      this.post.likes.push('currentUser'); // Replace 'currentUser' with actual user logic
    }
  }

  addComment(commentText: string) {
    if (this.post && commentText) {
      const newComment = {
        text: commentText,
        author: 'currentUser', // Replace 'currentUser' with actual user logic
        timestamp: new Date()
      };
      this.post.comments.push(newComment);
    }
  }
}
