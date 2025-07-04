import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  @Input() comment: any;
  @Input() replyFormVisible!: { [key: number]: boolean };
  @Input() replyContent!: { [key: number]: string };
  @Input() toggleReplyForm!: (id: number) => void;
  @Input() addReply!: (id: number) => void;
  @Input() likeDislikeComment!: (comment: any) => void;
  @Input() deleteComment!: (comment: any) => void;
  @Input() isModerator: boolean = false;
  @Input() userId: number | null = null;

  // UI state
  showMenu = false;
  isEditing = false;
  editedContent = '';
  showReplies = true;

  // Error/loading state for demo (could be passed as @Input if needed)
  isLoading = false;
  error: string | null = null;

  // For demo: currentUser (should be replaced by actual user context)
  get currentUser() {
    const user = localStorage.getItem('utilisateur');
    if (user) {
      const u = JSON.parse(user);
      return { avatar: u.avatar || '', name: u.prenom || '' };
    }
    return { avatar: '', name: '' };
  }

  // Menu actions
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }


  get canEdit(): boolean {
    return !!this.userId && this.comment?.auteur?.id === this.userId;
  }

  get canDelete(): boolean {
    return this.isModerator || (!!this.userId && this.comment?.auteur?.id === this.userId);
  }

  editComment() {
    this.isEditing = true;
    this.editedContent = this.comment.contenu;
    this.showMenu = false;
  }

  saveEdit() {
    if (this.editedContent.trim()) {
      this.comment.contenu = this.editedContent;
      this.isEditing = false;
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedContent = '';
  }

  reportComment() {
    alert('Commentaire signalé !');
    this.showMenu = false;
  }

  // Like logic
  get isLiked(): boolean {
    if (!this.userId || !this.comment?.likes) return false;
    return this.comment.likes.some((like: any) => like.utilisateurId === this.userId);
  }

  toggleLike() {
    if (this.likeDislikeComment) {
      this.likeDislikeComment(this.comment);
    }
  }

  // Reply logic
  get showReplyForm(): boolean {
    return this.replyFormVisible && this.replyFormVisible[this.comment.id];
  }

  get replyContentValue(): string {
    return this.replyContent && this.replyContent[this.comment.id] || '';
  }

  submitReply() {
    if (this.addReply && this.replyContentValue.trim()) {
      this.addReply(this.comment.id);
    }
  }

  cancelReply() {
    if (this.replyContent) {
      this.replyContent[this.comment.id] = '';
    }
    if (this.replyFormVisible) {
      this.replyFormVisible[this.comment.id] = false;
    }
  }

  // Toggle replies
  toggleReplies() {
    this.showReplies = !this.showReplies;
  }

  // Share (demo)
  shareComment() {
    alert('Lien du commentaire copié !');
  }

  // For root comment list (not used in single comment)
  get comments() {
    return null;
  }

  // Retry (demo)
  retry() {
    window.location.reload();
  }
}


