import {Component, Input, Output, EventEmitter, inject, ChangeDetectorRef, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../../member/services/community.service';
import {AuthService} from '../../../../member/services/auth.service';
@Component({
  selector: 'app-community-post',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './community-post.component.html',
  styleUrl: './community-post.component.scss'
})
export class CommunityPostComponent implements OnInit {
  @Input() post: any;
  @Output() postEvent = new EventEmitter<any>();
  communityService = inject(CommunityService);

  authService = inject(AuthService);
  isAuthenticated = false;
  userId: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {
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
    console.log('Post reçu :', this.post);
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


}
