import { Component } from '@angular/core';
import { NavBarAdminComponent } from '../../../../shared/components/nav-bar-admin/nav-bar-admin.component';
import { SafeUrlPipe } from '../../../../shared/pipes/safe-url.pipe';
@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [NavBarAdminComponent, SafeUrlPipe],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent {
  iframeSrc: string = '/admin/articles'; // valeur par défaut

  updateIframe(url: string) {
    this.iframeSrc = url;
  }
}



