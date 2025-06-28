import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunityService } from '../../../../member/services/community.service';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../member/services/auth.service';
@Component({
  selector: 'app-community-post-description',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-post-description.component.html',
  styleUrl: './community-post-description.component.scss'
})
export class CommunityPostDescriptionComponent implements OnInit {
  communityId!: number;
  postId!: number;
  post: any = null;
  loading = true;
  error: string | null = null;
  isAuthenticated = false;
  userId: number | null = null;
  newCommentContent: string = '';

  constructor(private route: ActivatedRoute, private communityService: CommunityService, private authService: AuthService) {
    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }
      }
    });
  }

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

  addComment() {
    if (this.newCommentContent.trim()) {
      this.communityService.addCommentToPost(this.communityId, this.postId, this.newCommentContent).subscribe({
        next: (newComment) => {
          const adaptedComment = {
            id: newComment.id || null,
            contenu: this.newCommentContent,
            modified: false,
            auteurId: this.userId,
            postId: this.postId,
            dateCreation: new Date().toISOString(),
            parentId: null,
            auteur: {
              id: this.userId,
              nom: JSON.parse(localStorage.getItem('utilisateur') || '{}').nom || '',
              prenom: JSON.parse(localStorage.getItem('utilisateur') || '{}').prenom || ''
            }
          };
          this.post.commentaires.push(adaptedComment);
          this.newCommentContent = '';
        },
        error: (err) => {
          console.error('Error adding comment:', err);
          this.error = 'Erreur lors de l\'ajout du commentaire.';
        }
      });
    }
  }
}
