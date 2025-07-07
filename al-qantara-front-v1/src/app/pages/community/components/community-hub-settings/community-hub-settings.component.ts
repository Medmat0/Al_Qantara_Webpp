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
    const logo = this.community.logoFile ?? null; // Utilise le fichier
    const nom = this.community.nom ?? '';
    const description = this.community.description ?? '';
    if (!confirm('Êtes-vous sûr de vouloir modifier cette communauté ?')) {
      return;
    }
    this.communityService.modifyCommunity(this.communityId, logo, nom, description).subscribe({
      next: () => {
        console.log('Communauté modifiée avec succès');
        this.router.navigate(['/communities', this.communityId]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la modification de la communauté.';
      }
    });
  }

  deleteCommunity() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette communauté ? Cette action est irréversible.')) {
      return;
    }
    this.communityService.deleteCommunity(this.communityId).subscribe({
      next: () => {
        console.log('Communauté supprimée avec succès');
        this.router.navigate(['/communities']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la suppression de la communauté.';
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
}
