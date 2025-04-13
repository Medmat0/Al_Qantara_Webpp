import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-revue-item',
  imports: [],
  templateUrl: './revue-item.component.html',
  standalone: true,
  styleUrl: './revue-item.component.scss'
})
export class RevueItemComponent {
  @Input() revue:any;

}
