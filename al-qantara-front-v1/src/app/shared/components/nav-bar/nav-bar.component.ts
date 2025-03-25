// src/app/shared/components/nav-bar/nav-bar.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NavbarService } from '../../../member/services/navbar.service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, NgIf],
  templateUrl: './nav-bar.component.html',
  standalone: true,
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  showButtons: boolean = true;

  constructor(private navbarService: NavbarService) {}

  ngOnInit() {
    this.navbarService.showButtons$.subscribe((show) => {
      this.showButtons = show;
    });
  }
}
