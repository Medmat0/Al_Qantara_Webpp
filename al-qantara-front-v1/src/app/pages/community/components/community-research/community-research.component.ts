import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunityService } from '../../../../member/services/community.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community-research',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-research.component.html',
  styleUrl: './community-research.component.scss'
})
export class CommunityResearchComponent implements OnDestroy {
  searchName = '';
  result: any = null;
  error: string | null = null;
  loading = false;
  private intervalId: any;
  private lastSearched = '';

  constructor(private communityService: CommunityService, private router: Router) {
    this.startAutoSearch();
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

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  searchCommunity(silent = false) {
    if (!this.searchName.trim()) {
      if (!silent) this.error = 'Veuillez entrer un nom de communauté.';
      this.result = null;
      return;
    }
    if (!silent) {
      this.error = null;
      this.result = null;
      this.loading = true;
    }
    this.lastSearched = this.searchName.trim();
    this.communityService.getCommunityByName(this.searchName.trim()).subscribe({
      next: (community) => {
        this.result = community;
        this.loading = false;
        this.error = null;
      },
      error: (err) => {
        this.error = err.error?.message || 'Aucune communauté trouvée.';
        this.result = null;
        this.loading = false;
      }
    });
  }

  goToCommunityHub(communityId: number) {
    this.router.navigate([`/communities/${communityId}`]);
  }
}
