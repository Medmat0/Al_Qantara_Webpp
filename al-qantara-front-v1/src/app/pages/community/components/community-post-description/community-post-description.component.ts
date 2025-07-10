import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
  hasVoted = false;
  selectedOption: number | null = null;
  voteError: string | null = null;
  voteSuccess = false;


  newCommentContent: string = '';
  replyFormVisible: { [key: number]: boolean } = {};
  replyContent: { [key: number]: string } = {};
  isModerator: boolean = false;
  isMember: boolean | null = false;

  constructor(private route: ActivatedRoute,
              private communityService: CommunityService,
              private authService: AuthService,
              private cdr: ChangeDetectorRef,
              private router: Router
              ) {
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
    this.likeDislikeComment = this.likeDislikeComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const communityId = params.get('communityId');
      const postId = params.get('postId');
      if (communityId && postId) {
        this.communityId = +communityId;
        this.postId = +postId;
        this.fetchPost();
        if( this.isAuthenticated) {
          this.checkMembership();
          this.communityService.isModerator(this.communityId).subscribe({
            next: (isMod) => this.isModerator = isMod,
            error: () => this.isModerator = false
          });
        }
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

  goToPostResearchWithTag(tag: string) {
    this.router.navigate(['/communities/posts/research'], { queryParams: { tag } });
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

  fetchPost() {
    this.loading = true;
    this.communityService.getCommunityPostById(this.communityId, this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.post.commentaires = this.organizeComments(this.post.commentaires);
        this.loading = false;

        if(this.isAuthenticated) {
          this.checkIfUserHasVoted();
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement du post.';
        this.loading = false;
      }
    });
  }

  checkIfUserHasVoted() {
    if (!this.post || !this.userId) return;
    for (let i = 0; i < this.post.pollOptions.length; i++) {
      if (this.post.pollOptions[i].votes?.some((v: { utilisateurId: number | null; }) => v.utilisateurId === this.userId)) {
        this.hasVoted = true;
        this.selectedOption = i;
        break;
      }
    }
  }

  votePollOption(index: number) {
    if (this.hasVoted) return;
    this.communityService.addVoteToPost(this.communityId, this.postId, index).subscribe({
      next: () => {
        this.hasVoted = true;
        this.selectedOption = index;
        this.voteSuccess = true;
        this.voteError = null;

        if (!this.post.pollOptions[index].votes) {
          this.post.pollOptions[index].votes = [];
        }
        this.post.pollOptions[index].votes.push({ utilisateurId: this.userId });

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.voteError = err.error?.message || "Erreur lors de l'envoi du vote.";
        this.voteSuccess = false;
      }
    });
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


  deletePost() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.')) {
      return;
    }
    this.communityService.deletePost(this.communityId, this.postId).subscribe({
      next: () => {
        console.log('Post deleted successfully');
        this.router.navigate(['/communities', this.communityId]); // Rediriger vers la page de la communauté
        // Rediriger ou mettre à jour l'état de la page après la suppression
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        this.error = 'Erreur lors de la suppression du post.';
      }
    });
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

  likeDislikeComment(comment: any) {
    this.communityService.likeDislikeComment(this.communityId, this.postId, comment.id).subscribe({
      next: (res) => {
        if (!comment.likes) {
          comment.likes = [];
        }
        // Vérifie si l'utilisateur a déjà liké APRÈS la réponse
        const existingLikeIndex = comment.likes.findIndex(
          (like: any) => like.utilisateurId === this.userId
        );

        if (existingLikeIndex !== -1) {
          // Supprime le like
          comment.likes.splice(existingLikeIndex, 1);
        } else {
          // Ajoute le like depuis la réponse de l'API
          if (res && res.comment) {
            comment.likes.push(res.comment);
          } else {
            comment.likes.push({ utilisateurId: this.userId });
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error liking comment:', err);
      }
    });
  }

  deleteComment(comment: any) {
    if (!comment) {
      console.error('Invalid comment:', comment);
      this.error = 'Erreur : commentaire invalide.';
      return;
    }

    this.communityService.deleteComment(this.communityId, this.postId, comment.id).subscribe({
      next: () => {
        this.removeCommentRecursive(this.post.commentaires, comment.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
        this.error = 'Erreur lors de la suppression du commentaire.';
      }
    });
  }

  private removeCommentRecursive(comments: any[], commentId: number): boolean {
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].id === commentId) {
        comments.splice(i, 1);
        return true;
      }
      if (comments[i].replies && this.removeCommentRecursive(comments[i].replies, commentId)) {
        return true;
      }
    }
    return false;
  }


  get isLiked(): boolean {
    if (!this.post || !this.userId || !this.post.likes) { return false; }
    return this.post.likes.some((like: any) => like.utilisateurId === this.userId);
  }

  get canDelete(): boolean {
    if (!this.post || !this.userId) { return false; }
    return this.isModerator || (this.post.auteur && this.post.auteur.id === this.userId);
  }

    scrollToCommentForm() {
    const el = document.getElementById('commentFormAnchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optionally focus the textarea
      const textarea = el.querySelector('textarea');
      if (textarea) {
        (textarea as HTMLTextAreaElement).focus();
      }
    }
  }

  // Total comments (including replies)
  get totalComments(): number {
    function count(comments: any[]): number {
      if (!comments) return 0;
      let total = 0;
      for (const c of comments) {
        total++;
        if (c.replies && c.replies.length) {
          total += count(c.replies);
        }
      }
      return total;
    }
    return this.post && this.post.commentaires ? count(this.post.commentaires) : 0;
  }

  goToCommunityHub() {
    this.router.navigate(['/communities', this.communityId]);
  }

}
