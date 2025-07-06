import { Component, EventEmitter, Input, Output } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-users-list',
  imports: [
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './users-list.component.html',
  standalone: true,
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {

  @Input() users: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() startConversation = new EventEmitter<number>();

  selectUser(userId: number) {
    this.startConversation.emit(userId);
    this.close.emit();
  }

}
