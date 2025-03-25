import { Component, Input } from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';
@Component({
  selector: 'app-nav-bar',
  imports: [
    RouterLink,
    NgIf
  ],
  templateUrl: './nav-bar.component.html',
  standalone: true,
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  @Input() showButtons: boolean = true;
}
