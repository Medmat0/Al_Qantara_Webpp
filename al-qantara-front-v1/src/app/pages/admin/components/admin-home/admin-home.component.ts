import { Component } from '@angular/core';
import { NavBarAdminComponent } from '../../../../shared/components/nav-bar-admin/nav-bar-admin.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [NavBarAdminComponent, RouterOutlet],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent {}



