import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserData } from '../../../../member/services/user.service';
import { AuthService } from '../../../../member/services/auth.service';

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

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Vérifier d'abord le statut d'authentification
    this.authService.checkAuthStatus().subscribe({
      next: (response) => {
        console.log('Auth status response:', response);
        if (response.authenticated) {
          this.loadUsers();
        } else {
          console.error('Not authenticated or not admin');
        }
      },
      error: (error) => {
        console.error('Auth check error:', error);
      }
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users response:', users);
        this.users = users;
        this.filterUsers();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  filterUsers() {
    if (!this.searchTerm?.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user?.nom?.toLowerCase().includes(term) ||
      user?.prenom?.toLowerCase().includes(term) ||
      user?.email?.toLowerCase().includes(term)
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
    if (this.selectedUser) {
      this.userService.toggleUserStatus(id, this.selectedUser.statut).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  // Méthodes à ajouter à votre classe UsersComponent

  /**
   * Génère les initiales à partir du prénom et nom
   */
  getInitials(prenom: string, nom: string): string {
    const prenomInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
    const nomInitial = nom ? nom.charAt(0).toUpperCase() : '';
    return prenomInitial + nomInitial;
  }

  /**
   * Compte le nombre d'administrateurs
   */
  getAdminCount(): number {
    return this.users.filter(user => user.role === 'ADMIN').length;
  }

  /**
   * Compte le nombre d'utilisateurs actifs
   */
  getActiveCount(): number {
    return this.users.filter(user => user.statut === 'ACTIF').length;
  }

  /**
   * Compte le nombre d'utilisateurs inactifs
   */
  getInactiveCount(): number {
    return this.users.filter(user => user.statut === 'INACTIF').length;
  }

  /**
   * Formate une date au format français (robuste)
   * Accepte string, Date, ou tout champ potentiellement mal typé
   */
  formatDate(dateInput: any): string {
    // Si c'est déjà une string ISO, on affiche direct
    if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}T/)) {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    // Sinon, fallback robuste
    let dateString = dateInput;
    if (!dateString && typeof dateInput === 'object' && dateInput !== null) {
      dateString = dateInput.dateInscription || dateInput.dateinscription || dateInput.date || '';
    }
    if (!dateString || typeof dateString !== 'string') return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Retourne la dernière connexion formatée
   * (À adapter selon votre structure de données)
   */
  getLastConnection(user: UserData): string {
    // Si vous avez une propriété lastConnection dans votre UserData
    // if (user.lastConnection) {
    //   const lastConnection = new Date(user.lastConnection);
    //   const now = new Date();
    //   const diffTime = Math.abs(now.getTime() - lastConnection.getTime());
    //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    //   
    //   if (diffDays === 1) {
    //     return 'Il y a 1 jour';
    //   } else if (diffDays < 7) {
    //     return `Il y a ${diffDays} jours`;
    //   } else {
    //     return this.formatDate(user.lastConnection);
    //   }
    // }
    
    // Pour l'instant, retourner une valeur par défaut
    return 'N/A';
  }
}