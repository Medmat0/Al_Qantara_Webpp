import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../../member/services/community.service';

@Component({
  selector: 'app-community-propositions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-propositions.component.html',
  styleUrl: './community-propositions.component.scss'
})
export class CommunityPropositionsComponent implements OnInit {
  communities: any[] = [];
  loading = true;
  error: string | null = null;

  @Output() communitySelected = new EventEmitter<any>();

  constructor(private communityService: CommunityService) {}

  ngOnInit() {
    this.communityService.getRandomCommunities().subscribe({
      next: (res) => {
        this.communities = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des communautés';
        this.loading = false;
      }
    });
  }

  selectCommunity(community: any) {
    this.communitySelected.emit(community);
  }
}
