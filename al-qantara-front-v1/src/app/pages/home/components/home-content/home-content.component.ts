import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home-content',
  imports: [
    RouterLink
  ],
  templateUrl: './home-content.component.html',
  standalone: true,
  styleUrl: './home-content.component.scss'
})
export class HomeContentComponent {

}
