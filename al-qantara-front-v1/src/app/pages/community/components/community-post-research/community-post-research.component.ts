import { Component, OnDestroy, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../../member/services/community.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community-post-research',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-post-research.component.html',
  styleUrl: './community-post-research.component.scss'
})
export class CommunityPostResearchComponent implements OnDestroy {
  searchName = '';
  posts: any[] = [];
  tagInput: string = '';
  tags: string[] = [];

  page = 1;
  limit = 3;
  hasMore = true;
  error: string | null = null;
  loading = false;
  loaderStartTime: number = 0;
  private intervalId: any;
  private lastSearched = '';

  constructor(private communityService: CommunityService, private router: Router) {
    this.startAutoSearch();
    window.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    window.removeEventListener('scroll', this.onScroll, true);
  }

  onScroll = (): void => {
    if (this.loading || !this.hasMore || (!this.searchName.trim() && this.tags.length === 0)) return;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 200;
    if (scrollPosition >= threshold) {
      this.loadMorePosts();
    }
  };

  addTag() {
    const tag = this.tagInput.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
    }
    this.tagInput = '';
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  startAutoSearch() {
    this.intervalId = setInterval(() => {
      if (
        this.searchName.trim() &&
        this.searchName.trim() !== this.lastSearched
      ) {
        this.searchCommunityPost(true);
      }
    }, 2000);
  }



  loadMorePosts() {
    if (this.loading || !this.hasMore) return;
    this.loading = true;
    const loaderStartTime = Date.now();

    this.communityService.getCommunityPostsByName(
      this.searchName.trim(),
      this.tags,
      this.page,
      this.limit
    ).subscribe({
      next: (response) => {
        const newPosts = response.posts || [];
        if (newPosts.length < this.limit) this.hasMore = false;

        const elapsed = Date.now() - loaderStartTime;
        const minDuration = 250;

        const finish = () => {
          this.posts = [...this.posts, ...newPosts];
          this.page++;
          this.loading = false;
        };

        if (elapsed < minDuration) {
          setTimeout(finish, minDuration - elapsed);
        } else {
          finish();
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  searchCommunityPost(silent = false) {
    const hasName = this.searchName.trim().length > 0;
    const hasTags = this.tags.length > 0;
    if (!hasName && !hasTags) {
      if (!silent) this.error = 'Veuillez entrer un nom de post ou au moins un tag.';
      this.posts = [];
      this.hasMore = false;
      return;
    }
    if (!silent) {
      this.error = null;
      this.posts = [];
      this.loading = true;
      this.loaderStartTime = Date.now();
    }
    this.lastSearched = this.searchName.trim();
    this.page = 1;
    this.hasMore = true;
    this.communityService.getCommunityPostsByName(
      this.searchName.trim(),
      this.tags,
      this.page,
      this.limit
    ).subscribe({
      next: (response) => {
        const elapsed = Date.now() - this.loaderStartTime;
        const minDuration = 250;
        const finish = () => {
          this.posts = response.posts || [];
          this.hasMore = (response.posts && response.posts.length === this.limit);
          this.loading = false;
          this.error = this.posts.length === 0 ? 'Aucun post trouvé.' : null;
          this.page = 2;
        };
        if (elapsed < minDuration) {
          setTimeout(finish, minDuration - elapsed);
        } else {
          finish();
        }
      },
      error: (err) => {
        const elapsed = Date.now() - this.loaderStartTime;
        const minDuration = 2500;
        const finish = () => {
          this.error = err.error?.message || 'Erreur lors de la recherche.';
          this.posts = [];
          this.hasMore = false;
          this.loading = false;
        };
        if (elapsed < minDuration) {
          setTimeout(finish, minDuration - elapsed);
        } else {
          finish();
        }
      }
    });
  }

  goToCommunityPostDescription(communityId: number, postId: number) {
    this.router.navigate([`/communities/${communityId}/posts/${postId}`]);
  }
}
