import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../../member/services/community.service';
import { CommunityPostComponent } from '../community-post/community-post.component';
import { CommunityPropositionsComponent } from '../community-propositions/community-propositions.component';
import { Router, RouterModule } from '@angular/router';
import {AuthService} from '../../../../member/services/auth.service';
import { CommunityPostResearchComponent } from '../community-post-research/community-post-research.component';
import { CommunityResearchComponent } from '../community-research/community-research.component';

@Component({
  selector: 'app-community-home',
  standalone: true,
  imports: [
    CommonModule,
    CommunityPostComponent,
    CommunityPropositionsComponent,
    RouterModule,
    CommunityPostResearchComponent,
    CommunityResearchComponent
  ],
  templateUrl: './community-home.component.html',
  styleUrl: './community-home.component.scss'
})
export class CommunityHomeComponent implements OnInit {
  posts: any[] = [];
  loading = false;
  error: string | null = null;
  isModerator: boolean = false;
  userId: number | null = null;
  isAuthenticated: boolean = false;

  showResearchPopup = false; // Par défaut, le popup est fermé
  showCommunityResearchPopup = false; // Par défaut, le popup de recherche communauté est fermé
  showPostResearchPopup = false; // Par défaut, le popup de recherche post est fermé

  page = 1;
  limit = 5;
  allLoaded = false;

  constructor(
    private communityService: CommunityService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {

    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      console.log('Authentication status:', this.isAuthenticated);
      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }
      } else {
        this.userId = null;
      }
    });

    this.loadPosts();

  }



  loadPosts() {
    if (this.loading || this.allLoaded) return;
    this.loading = true;
    this.communityService.getRandomPosts(this.page, this.limit).subscribe({
      next: (res) => {
        const newPosts = res.posts?.posts ?? [];
        this.posts = [...this.posts, ...newPosts];
        this.allLoaded = newPosts.length < this.limit;
        this.loading = false;
        this.page++;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des posts';
        this.loading = false;
      }
    });
  }

  onScroll(event: any): void {
    if (this.loading || this.allLoaded) return;
    const element = event.target;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 100) {
      this.loadPosts();
    }
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {

      if(confirm('Vous devez être connecté pour créer une communauté.')){
        this.router.navigate(['auth/login']);
      }
      return false;

    }
    return true;
  }

  onPostEvent(event: any) {
    if (event?.type === 'deleted') {
      this.posts = this.posts.filter(post => post.id !== event.postId);
    }
  }

  onCommunitySelected(community: any) {
    this.router.navigate([`/communities/${community.id}`]);
  }

  goToPost(post: any) {
    // Rediriger vers la page du post
    this.router.navigate([`/communities/${post.communityId}/posts/${post.id}`]);
    console.log('Aller au post:', post);
  }

  goToCreationForm() {
    if (this.checkAuthentication()) {
      this.router.navigate(['/communities/create']);
    }
  }
    trackByPostId(index: number, post: any): any {
    return post.id;
  }

  openResearchPopup() {
    console.log('POPUP CLICK - AVANT:', this.showResearchPopup);
    this.showResearchPopup = true;
    console.log('POPUP CLICK - APRÈS:', this.showResearchPopup);

    // Empêcher le scroll de la page
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px'; // Compensate for scrollbar

    // Force le reflow pour s'assurer que l'affichage est mis à jour
    setTimeout(() => {
      const overlay = document.querySelector('.community-popup-overlay');
      if (overlay) {
        console.log('POPUP OVERLAY FOUND AND VISIBLE');
      }
    }, 10);
  }

  closeResearchPopup() {
    this.showResearchPopup = false;

    // Restaurer le scroll
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  openCommunityResearchPopup() {
    this.showCommunityResearchPopup = true;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px';
  }

  closeCommunityResearchPopup() {
    this.showCommunityResearchPopup = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  openPostResearchPopup() {
    this.showPostResearchPopup = true;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '15px';
  }

  closePostResearchPopup() {
    this.showPostResearchPopup = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

}
