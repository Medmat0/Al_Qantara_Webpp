// src/app/shared/components/nav-bar/nav-bar.component.ts
import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { NgIf } from '@angular/common';
import { NavbarService } from '../../services/navbar.service';
import { AuthService } from '../../../member/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, NgIf],
  templateUrl: './nav-bar.component.html',
  standalone: true,
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  showButtons: boolean = true;
  isAuthenticated: boolean = false;
  username: string | null = null;

  constructor(
    private authService: AuthService,
    private navbarService: NavbarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.navbarService.showButtons$.subscribe((show) => {
      this.showButtons = show;
    });

    this.authService.checkAuthStatus().subscribe({
      next: () => {
        this.authService.authStatus$.subscribe((status) => {
          this.isAuthenticated = status;
          if (status) {
            const user = localStorage.getItem('user');
            if (user) {
              this.username = JSON.parse(user).prenom;
              this.cdr.detectChanges();
            }
          } else {
            this.username = null;
          }
        });
      },
      error: (err) => {
        console.error('Error checking auth status:', err);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('user');
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
      }
    });
  }
}
