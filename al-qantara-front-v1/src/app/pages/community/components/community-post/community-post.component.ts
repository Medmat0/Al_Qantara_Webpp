import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-community-post',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './community-post.component.html',
  styleUrl: './community-post.component.scss'
})
export class CommunityPostComponent {
  @Input() post: any;
  @Output() postEvent = new EventEmitter<any>();


}
