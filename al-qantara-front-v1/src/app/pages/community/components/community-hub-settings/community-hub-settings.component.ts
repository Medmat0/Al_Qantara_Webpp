import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../../member/services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CommunityService} from '../../../../member/services/community.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-community-hub-settings',
  imports: [
    FormsModule,
    NgIf
  ],
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

  showConfirmModal = false;
  confirmType: 'modify' | 'delete' | null = null;


  constructor(
    private authService: AuthService,
    private communityService: CommunityService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }


  ngOnInit() {

    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
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





  onLogoFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'image/png') {
        this.error = 'Seuls les fichiers PNG sont acceptés.';
        this.community.logoFile = null;
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        this.error = 'Le fichier est trop volumineux. La taille maximale est de 20 Mo.';
        return;
      }
      this.community.logoFile = file; // Stocke le fichier pour l'envoi
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.community.logo = e.target?.result as string;
        this.error = null;
      };
      reader.readAsDataURL(file);
    } else {
      this.error = 'Aucun fichier sélectionné.';
    }
  }

  openConfirm(type: 'modify' | 'delete') {
    this.confirmType = type;
    this.showConfirmModal = true;
  }

  onCancelConfirm() {
    this.showConfirmModal = false;
  }

  onConfirm() {
    if (this.confirmType === 'modify') {
      this.modifyCommunityAction();
    } else if (this.confirmType === 'delete') {
      this.deleteCommunityAction();
    }
    this.showConfirmModal = false;
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancelConfirm();
    }
  }

  modifyCommunity() {
    this.openConfirm('modify');
  }

  deleteCommunity() {
    this.openConfirm('delete');
  }

// Actions réelles
  modifyCommunityAction() {
    const logo = this.community.logoFile ?? null;
    const nom = this.community.nom ?? '';
    const description = this.community.description ?? '';
    this.communityService.modifyCommunity(this.communityId, logo, nom, description).subscribe({
      next: () => {
        this.router.navigate(['/communities', this.communityId]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la modification de la communauté.';
      }
    });
  }

  deleteCommunityAction() {
    this.communityService.deleteCommunity(this.communityId).subscribe({
      next: () => {
        this.router.navigate(['/communities']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la suppression de la communauté.';
      }
    });
  }
}
