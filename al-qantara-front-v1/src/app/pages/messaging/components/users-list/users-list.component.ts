import { Component, EventEmitter, Input, Output } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-list',
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './users-list.component.html',
  standalone: true,
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {

  @Input() users: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() startConversation = new EventEmitter<number>();

  searchTerm: string = '';

  get filteredUsers() {
    if (!this.searchTerm) {
      return this.users;
    }
    return this.users.filter(user =>
      user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectUser(userId: number) {
    this.startConversation.emit(userId);
    this.close.emit();
  }

  clearSearch() {
    this.searchTerm = '';
  }
}
