import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  template: `
    <div class="users-container">
      <h2>Gestion des Utilisateurs</h2>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 20px;
    }
  `]
})
export class UsersComponent {}