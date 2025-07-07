import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar-admin',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav-bar-admin.component.html',
  styleUrl: './nav-bar-admin.component.scss'
})
export class NavBarAdminComponent implements OnInit {
  isMenuOpen = true;

  constructor(private router: Router) {}

  ngOnInit() {
    if (this.router.url.includes('/admin')) {
      this.isMenuOpen = true;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
