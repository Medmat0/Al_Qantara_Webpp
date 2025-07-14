import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminGuidesService, Guide, ApiResponse } from '../../../../admin/services/admin-guides.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../member/services/auth.service';
import { Router } from '@angular/router';
import { Utilisateur } from '../../../../member/models/utilisateur';

@Component({
  selector: 'app-admin-guides',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-guides.component.html',
  styleUrls: ['./admin-guides.component.scss']
})
export class AdminGuidesComponent implements OnInit {
  guides: Guide[] = [];
  loading = true;
  deleting = false;
  guideToDelete: Guide | null = null;
  currentUser: Utilisateur | null = null;
  isAuthenticated = false;
  errorMessage = ''; // Add error message property
  
  filters = {
    actif: 'all' as boolean | 'all',
    page: 1,
    limit: 10
  };
  
  pagination: any = null;

  constructor(
    private guidesService: AdminGuidesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const userStr = localStorage.getItem('utilisateur');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.isAuthenticated = true;
      
      // Check if user is admin
      if (this.currentUser?.role !== 'ADMIN') {
        console.error('Access denied: Admin role required');
        this.router.navigate(['/']);
        return;
      }
      
      this.loadGuides();
    } else {
      // Check auth status from server
      this.authService.checkAuthStatus().subscribe({
        next: (response) => {
          if (response.authenticated && response.utilisateur?.role === 'ADMIN') {
            this.currentUser = response.utilisateur;
            this.isAuthenticated = true;
            this.loadGuides();
          } else {
            console.error('Access denied: Admin authentication required');
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Authentication check failed:', error);
          this.router.navigate(['/']);
        }
      });
    }
  }

  loadGuides() {
    this.loading = true;
    this.errorMessage = ''; // Clear previous errors
    this.guidesService.getAllGuides(this.filters).subscribe({
      next: (response: ApiResponse<Guide[]>) => {
        if (response.success) {
          this.guides = response.data;
          this.pagination = response.pagination;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des guides:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          localStorage.removeItem('utilisateur');
          this.isAuthenticated = false;
          this.router.navigate(['/']);
        } else if (error.status === 403) {
          this.errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else {
          this.errorMessage = 'Erreur lors du chargement des guides.';
        }
        
        this.loading = false;
        
        // Clear error message after 10 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 10000);
      }
    });
  }

  changePage(page: number) {
    this.filters.page = page;
    this.loadGuides();
  }

  confirmDelete(guide: Guide) {
    this.guideToDelete = guide;
  }

  cancelDelete() {
    this.guideToDelete = null;
  }

  deleteGuide() {
    if (!this.guideToDelete) return;
    
    this.deleting = true;
    this.errorMessage = ''; // Clear previous errors
    this.guidesService.deleteGuide(this.guideToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.guides = this.guides.filter(g => g.id !== this.guideToDelete!.id);
          this.guideToDelete = null;
        }
        this.deleting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          localStorage.removeItem('utilisateur');
          this.isAuthenticated = false;
          this.router.navigate(['/']);
        } else if (error.status === 403) {
          this.errorMessage = 'Accès refusé pour supprimer ce guide.';
        } else {
          this.errorMessage = 'Erreur lors de la suppression du guide.';
        }
        
        this.deleting = false;
        this.guideToDelete = null;
        
        // Clear error message after 10 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 10000);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}
