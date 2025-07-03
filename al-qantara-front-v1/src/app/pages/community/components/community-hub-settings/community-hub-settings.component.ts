import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../../member/services/auth.service';
import {ActivatedRoute} from '@angular/router';
import {CommunityService} from '../../../../member/services/community.service';

@Component({
  selector: 'app-community-hub-settings',
  imports: [],
  templateUrl: './community-hub-settings.component.html',
  standalone: true,
  styleUrl: './community-hub-settings.component.scss'
})
export class CommunityHubSettingsComponent implements OnInit {
  communityId!: number;
  isAuthenticated: boolean = false;
  userId: number | null = null;
  community: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private communityService: CommunityService,
    private route: ActivatedRoute,
  ) {
  }


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

    this.route.paramMap.subscribe(params => {
      const id = params.get('communityId');
      if (id) {
        this.communityId = +id;
        this.fetchCommunity();
      }
    });
  }


  fetchCommunity() {
    this.loading = true;
    this.communityService.getCommunityById(this.communityId).subscribe({
      next: (community) => {
        this.community = community;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement de la communauté.';
        this.loading = false;

      }
    });
  }

  modifyCommunity() {
    this.communityService.modifyCommunity(this.communityId, this.community).subscribe({
      next: () => {
        console.log('Communauté modifiée avec succès');
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la modification de la communauté.';
      }
    });

  }



}
