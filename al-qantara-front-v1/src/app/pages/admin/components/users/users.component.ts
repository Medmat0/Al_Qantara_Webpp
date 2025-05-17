import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserData } from '../../../../member/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: UserData[] = [];
  filteredUsers: UserData[] = [];
  searchTerm: string = '';
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalAction: (() => void) | null = null;
  selectedUser: UserData | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.nom.toLowerCase().includes(term) ||
      user.prenom.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  openDeleteModal(user: UserData) {
    this.selectedUser = user;
    this.modalTitle = 'Confirmer la suppression';
    this.modalMessage = `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`;
    this.modalAction = () => this.deleteUser(user.id);
    this.showModal = true;
  }

  openPromoteModal(user: UserData) {
    this.selectedUser = user;
    this.modalTitle = 'Confirmer la promotion';
    this.modalMessage = `Êtes-vous sûr de vouloir promouvoir ${user.prenom} ${user.nom} au rôle d'administrateur ?`;
    this.modalAction = () => this.promoteUser(user.id);
    this.showModal = true;
  }

  openDemoteModal(user: UserData) {
    this.selectedUser = user;
    this.modalTitle = 'Confirmer la rétrogradation';
    this.modalMessage = `Êtes-vous sûr de vouloir rétrograder ${user.prenom} ${user.nom} au rôle d'utilisateur ?`;
    this.modalAction = () => this.demoteUser(user.id);
    this.showModal = true;
  }

  openStatusModal(user: UserData) {
    this.selectedUser = user;
    const action = user.statut === 'ACTIF' ? 'désactiver' : 'activer';
    this.modalTitle = `Confirmer le changement de statut`;
    this.modalMessage = `Êtes-vous sûr de vouloir ${action} le compte de ${user.prenom} ${user.nom} ?`;
    this.modalAction = () => this.toggleUserStatus(user.id);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
    this.modalAction = null;
  }

  confirmModal() {
    if (this.modalAction) {
      this.modalAction();
    }
    this.closeModal();
  }

  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

  promoteUser(id: string) {
    this.userService.promoteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

  demoteUser(id: string) {
    this.userService.demoteUser(id).subscribe(() => {
      this.loadUsers();
    });
  }

  toggleUserStatus(id: string) {
    this.userService.toggleUserStatus(id).subscribe(() => {
      this.loadUsers();
    });
  }
}