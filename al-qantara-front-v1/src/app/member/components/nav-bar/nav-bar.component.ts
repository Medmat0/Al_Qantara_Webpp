import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../utils/config';
import { Component, HostListener } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { NavbarService } from '../../services/navbar.service';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, NgIf, NgClass],
  templateUrl: './nav-bar.component.html',
  standalone: true,
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  showButtons: boolean = true;
  isAuthenticated: boolean = false;
  username: string | null = null;
  isUserMenuOpen: boolean = false;
  isMenuOpen = false;
  userRole: string | null = null;
  user: any = null; // Ajouté pour stocker l'utilisateur complet

  constructor(
    private authService: AuthService,
    private navbarService: NavbarService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.navbarService.showButtons$.subscribe((show) => {
      this.showButtons = show;
    });

    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      if (status) {
        // Récupérer l'utilisateur via l'API du profil pour avoir l'adhésion
        this.http.get<any>(`${API_URL}/user/profile`, { withCredentials: true })
          .subscribe({
            next: (res) => {
              this.user = res.user;
              this.username = this.user.prenom;
              this.userRole = this.user.role || null;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.user = null;
              this.username = null;
              this.userRole = null;
            }
          });
      } else {
        this.user = null;
        this.username = null;
        this.userRole = null;
      }
    });
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    const userMenu = document.querySelector('.user-menu');
    const target = event.target as HTMLElement;

    if (userMenu && !userMenu.contains(target)) {
      this.isUserMenuOpen = false;
    }
  }

  logout() {
    this.isUserMenuOpen = false;
    this.isMenuOpen = false;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
      }
    });
  }

  navigateToProfile(): void {
    this.isUserMenuOpen = false;  // Ferme le menu
    this.router.navigate(['/profile']);
  }

  navigateToMessagerie(): void {
    this.isUserMenuOpen = false;  // Ferme le menu
    this.router.navigate(['/messaging']);
  }

  navigateTo(path: string): void {
    this.isMenuOpen = false;
    this.router.navigate([path]);
  }

  // Affiche le bouton "Devenir membre" si l'utilisateur est connecté, a le rôle "user" (non "membre" ou "admin")
  showBecomeMemberButton(): boolean {
    // Affiche le bouton si l'utilisateur n'a pas une adhésion active (comme dans le profil)
     if (!this.isAuthenticated || !this.user) return false;
    // On cache le bouton si le statut est ACTIF ou ACCEPTE
    return !this.user.adhesion || (this.user.adhesion && this.user.adhesion.statut !== 'ACTIF' && this.user.adhesion.statut !== 'ACCEPTE');
  }

  goToAdhesion(): void {
    this.isMenuOpen = false;
    this.router.navigate(['/adhesion']);
  }
}
