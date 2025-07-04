
import {Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../../member/services/community.service';
import { AuthService } from '../../../../member/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-community-post',
  standalone: true,
  imports: [ CommonModule, RouterModule, CommentComponent ],
  templateUrl: './community-post.component.html',
  styleUrl: './community-post.component.scss'
})
export class CommunityPostComponent implements OnInit {
  @Input() post: any;
  @Output() postEvent = new EventEmitter<any>();
  @Input() isModerator: boolean = false;
  @Input() isOnCommunityPage: boolean = false;
  communityService = inject(CommunityService);
  authService = inject(AuthService);
  isAuthenticated = false;
  userId: number | null = null;

  // For comments/replies
  replyFormVisible: { [key: number]: boolean } = {};
  replyContent: { [key: number]: string } = {};

  constructor(private cdr: ChangeDetectorRef, private router: Router) {
    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }
      }
    });
    this.toggleReplyForm = this.toggleReplyForm.bind(this);
    this.addReply = this.addReply.bind(this);
    this.likeDislikeComment = this.likeDislikeComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  ngOnInit() {}

  get isLiked(): boolean {
    if (!this.userId || !this.post?.likes) return false;
    return this.post.likes.some((like: any) => like.utilisateurId === this.userId);
  }

  likeDislikePost(event: MouseEvent) {
    event.stopPropagation();
    this.communityService.likeDislikePost(this.post.communityId, this.post.id).subscribe({
      next: (res) => {
        if (!this.post.likes) {
          this.post.likes = [];
        }
        // Vérifie si l'utilisateur a déjà liké
        const existingLikeIndex = this.post.likes.findIndex(
          (like: any) => like.utilisateurId === this.userId
        );

        if (existingLikeIndex !== -1) {
          // Supprime le like
          this.post.likes.splice(existingLikeIndex, 1);
        } else {
          // Ajoute le like depuis la réponse de l'API
          if (res && res.post) {
            this.post.likes.push(res.post);
          } else {
            this.post.likes.push({ utilisateurId: this.userId });
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error liking post:', err);
      }
    });
  }

  deletePost(event: MouseEvent) {
    event.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer ce post ?')) {
      this.communityService.deletePost(this.post.communityId, this.post.id).subscribe({
        next: () => {
          this.postEvent.emit({ type: 'deleted', postId: this.post.id });
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du post:', err);
        }
      });
    }
  }

  // --- Comment/reply logic for child CommentComponent ---
  toggleReplyForm(commentId: number) {
    this.replyFormVisible[commentId] = !this.replyFormVisible[commentId];
  }

  addReply(commentId: number) {
    // This should call a service to add a reply, then update post.commentaires accordingly
    // For now, just close the form
    this.replyFormVisible[commentId] = false;
    this.replyContent[commentId] = '';
    // You can emit an event or call a parent method here if needed
  }

  likeDislikeComment(comment: any) {
    // This should call a service to like/dislike a comment, then update comment.likes accordingly
    // For now, just toggle a dummy like
    if (!comment.likes) comment.likes = [];
    const idx = comment.likes.findIndex((like: any) => like.utilisateurId === this.userId);
    if (idx !== -1) {
      comment.likes.splice(idx, 1);
    } else {
      comment.likes.push({ utilisateurId: this.userId });
    }
  }

  deleteComment(comment: any) {
    // This should call a service to delete a comment, then update post.commentaires accordingly
    // For now, just remove from array
    if (this.post && this.post.commentaires) {
      const removeRecursive = (comments: any[], id: number): boolean => {
        for (let i = 0; i < comments.length; i++) {
          if (comments[i].id === id) {
            comments.splice(i, 1);
            return true;
          }
          if (comments[i].replies && removeRecursive(comments[i].replies, id)) {
            return true;
          }
        }
        return false;
      };
      removeRecursive(this.post.commentaires, comment.id);
    }
  }
}
