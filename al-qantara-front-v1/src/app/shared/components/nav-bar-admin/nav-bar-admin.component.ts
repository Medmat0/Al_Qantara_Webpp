import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-nav-bar-admin',
  standalone: true,
  templateUrl: './nav-bar-admin.component.html',
  styleUrl: './nav-bar-admin.component.scss'
})
export class NavBarAdminComponent {
  @Output() navigateTo = new EventEmitter<string>();

  goTo(url: string) {
    this.navigateTo.emit(url);
  }
}
