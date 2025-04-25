import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-bar-admin',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-bar-admin.component.html',
  styleUrl: './nav-bar-admin.component.scss'
})
export class NavBarAdminComponent {}
