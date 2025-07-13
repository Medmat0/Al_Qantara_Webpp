import { Component, Input } from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-spot-description',
  imports: [
    NgIf
  ],
  templateUrl: './spot-description.component.html',
  standalone: true,
  styleUrl: './spot-description.component.scss'
})
export class SpotDescriptionComponent {

  @Input() spot: any;

}
