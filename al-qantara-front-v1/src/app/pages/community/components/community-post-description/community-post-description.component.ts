import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunityService } from '../../../../member/services/community.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../member/services/auth.service';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-community-post-description',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentComponent],
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
  replyFormVisible: { [key: number]: boolean } = {};
  replyContent: { [key: number]: string } = {};

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
    this.addReply = this.addReply.bind(this);
    this.toggleReplyForm = this.toggleReplyForm.bind(this);
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

  organizeComments(comments: any[]): any[] {
    const commentMap: { [key: number]: any } = {};
    const rootComments: any[] = [];

    // Créer une map des commentaires par ID
    comments.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });

    // Organiser les commentaires en structure imbriquée
    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap[comment.parentId];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  fetchPost() {
    this.loading = true;
    this.communityService.getCommunityPostById(this.communityId, this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.post.commentaires = this.organizeComments(this.post.commentaires);
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
      this.post.likes.push('currentUser');
    }
  }

  addComment() {
    if (this.newCommentContent.trim()) {
      this.communityService.addCommentToPost(this.communityId, this.postId, this.newCommentContent).subscribe({
        next: (response) => {
          const newComment = response.comment || response;
          const adaptedComment = {
            id: newComment.id || null,
            contenu: newComment.contenu || this.newCommentContent,
            modified: false,
            auteurId: this.userId,
            postId: this.postId,
            dateCreation: newComment.dateCreation || new Date().toISOString(),
            parentId: null,
            auteur: {
              id: this.userId,
              nom: JSON.parse(localStorage.getItem('utilisateur') || '{}').nom || '',
              prenom: JSON.parse(localStorage.getItem('utilisateur') || '{}').prenom || ''
            },
            replies: []
          };
          console.log('Adding comment:', adaptedComment.id);
          if (!this.post.commentaires) {
            this.post.commentaires = [];
          }
          // Use the id returned by the backend to ensure replies work
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

  toggleReplyForm(commentId: number) {
    this.replyFormVisible[commentId] = !this.replyFormVisible[commentId];
  }

  addReply(commentId: number) {
    if (!commentId) {
      console.error('Invalid parentCommentId:', commentId);
      this.error = 'Erreur : ID du commentaire parent invalide.';
      return;
    }

    const replyContent = this.replyContent[commentId]?.trim();
    if (replyContent) {
      this.communityService.addReplyToComment(this.communityId, this.postId, commentId, replyContent).subscribe({
        next: (newReply) => {
          const adaptedReply =  newReply.comment || newReply;
          console.log('Adding reply:', adaptedReply.id, 'parentId:', adaptedReply.parentId);
          if (!adaptedReply.id) {
            console.error('Invalid reply ID:', adaptedReply);
            this.error = 'Erreur : Réponse invalide retournée par le serveur.';
            return;
          }
          const parentComment = this.findCommentById(this.post.commentaires, commentId);
          if (parentComment) {
            parentComment.replies = parentComment.replies || [];
            parentComment.replies.push(adaptedReply);
          }
          this.replyContent[commentId] = '';
          this.replyFormVisible[commentId] = false;
        },
        error: (err) => {
          console.error('Error adding reply:', err);
          this.error = 'Erreur lors de l\'ajout de la réponse.';
        }
      });
    }
  }

  findCommentById(comments: any[], id: number): any {
    for (const comment of comments) {
      if (comment.id === id) {
        return comment;
      }
      if (comment.replies) {
        const found = this.findCommentById(comment.replies, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
