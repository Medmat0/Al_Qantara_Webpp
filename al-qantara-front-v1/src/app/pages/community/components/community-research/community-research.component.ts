import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../../member/services/community.service';
import { Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-community-research',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-research.component.html',
  styleUrl: './community-research.component.scss'
})
export class CommunityResearchComponent implements OnDestroy {
  searchName = '';
  result: any[] = [];
  error: string | null = null;
  loading = false;
  private intervalId: any;
  private lastSearched = '';

  page = 1;
  limit = 5;
  allLoaded = false;

  @Output() communitySelected = new EventEmitter<number>();


  constructor(private communityService: CommunityService, private router: Router) {
    this.startAutoSearch();
    window.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    window.removeEventListener('scroll', this.onScroll, true);
  }

  startAutoSearch() {
    this.intervalId = setInterval(() => {
      if (
        this.searchName.trim() &&
        this.searchName.trim() !== this.lastSearched
      ) {
        this.searchCommunity(true);
      }
    }, 2000);
  }

  searchCommunity(silent = false) {
    if (!this.searchName.trim()) {
      if (!silent) this.error = 'Veuillez entrer un nom de communauté.';
      this.result = [];
      this.allLoaded = false;
      return;
    }
    if (!silent) {
      this.error = null;
      this.result = [];
      this.loading = true;
      this.page = 1;
      this.allLoaded = false;
    }
    this.lastSearched = this.searchName.trim();
    this.communityService.getCommunityByName(this.searchName.trim(), this.page, this.limit).subscribe({
      next: (response) => {
        this.result = response.communities || [];
        this.allLoaded = !response.communities || response.communities.length < this.limit;
        this.loading = false;
        this.error = this.result.length === 0 ? 'Aucune communauté trouvée.' : null;
        this.page = 2;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la recherche.';
        this.result = [];
        this.loading = false;
        this.allLoaded = false;
      }
    });
  }




  loadMoreCommunities() {
    if (this.loading || this.allLoaded || !this.searchName.trim()) return;
    this.loading = true;
    this.communityService.getCommunityByName(this.searchName.trim(), this.page, this.limit).subscribe({
      next: (response) => {
        const newCommunities = response.communities || [];
        this.result = [...this.result, ...newCommunities];
        this.allLoaded = newCommunities.length < this.limit;
        this.loading = false;
        this.page++;
        //this.checkNeedMoreContent();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onScroll = ($event: Event): void => {
    if (this.loading || this.allLoaded || !this.searchName.trim()) return;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 200;
    if (scrollPosition >= threshold) {
      this.loadMoreCommunities();
    }
  };

  goToCommunityHub(communityId: number) {
    this.communitySelected.emit(communityId);
    this.router.navigate([`/communities/${communityId}`]);
  }
}
