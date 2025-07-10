import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserData } from '../../../../member/services/user.service';
import { AuthService } from '../../../../member/services/auth.service';

export interface UserStats {
  totalUsers: number;
  totalAdherents: number;
  totalDons: number;
  totalRevenueAdhesions: number;
  totalRevenueDons: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  newAdherentsThisMonth: number;
  averageDonAmount: number;
  adminCount: number;
  userCount: number;
  adherentCount: number;
  usersOnline: number;
  usersOffline: number;
  revenueByMonth: any;
  recentAdhesions: any[];
  recentDons: any[];
}

export interface EnhancedUserData extends UserData {
  statutAdhesion: string;
  totalDons: number;
  nombreDons: number;
  totalPaiementsEvenements: number;
  nombreParticipations: number;
  dernierDon: string | null;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: EnhancedUserData[] = [];
  filteredUsers: EnhancedUserData[] = [];
  searchTerm: string = '';
  stats: UserStats | null = null;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalAction: (() => void) | null = null;
  selectedUser: EnhancedUserData | null = null;

  // États d'affichage
  loading = true;
  showStatsDetails = false;

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
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Auth check error:', error);
        this.loading = false;
      }
    });
  }

  loadUsers() {
    this.loading = true;
    console.log('🔄 Loading users...');
    
    this.userService.getUsers().subscribe({
      next: (response: any) => {
        console.log('✅ Users response:', response);
        console.log('📊 Users data:', response.users);
        console.log('📈 Stats data:', response.stats);
        
        this.users = response.users || [];
        this.stats = response.stats || null;
        this.filterUsers();
        this.loading = false;
        
        console.log('🏁 Loading completed. Users count:', this.users.length);
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        
        this.users = [];
        this.filteredUsers = [];
        this.stats = null;
        this.loading = false;
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

  toggleStatsDetails() {
    this.showStatsDetails = !this.showStatsDetails;
  }

  openDeleteModal(user: EnhancedUserData) {
    this.selectedUser = user;
    this.modalTitle = 'Confirmer la suppression';
    this.modalMessage = `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.prenom} ${user.nom} ?`;
    this.modalAction = () => this.deleteUser(user.id);
    this.showModal = true;
  }

  openPromoteModal(user: EnhancedUserData) {
    this.selectedUser = user;
    this.modalTitle = 'Confirmer la promotion';
    this.modalMessage = `Êtes-vous sûr de vouloir promouvoir ${user.prenom} ${user.nom} au rôle d'administrateur ?`;
    this.modalAction = () => this.promoteUser(user.id);
    this.showModal = true;
  }

  openDemoteModal(user: EnhancedUserData) {
    this.selectedUser = user;
    this.modalTitle = 'Confirmer la rétrogradation';
    this.modalMessage = `Êtes-vous sûr de vouloir rétrograder ${user.prenom} ${user.nom} au rôle d'utilisateur ?`;
    this.modalAction = () => this.demoteUser(user.id);
    this.showModal = true;
  }

  openStatusModal(user: EnhancedUserData) {
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

  /**
   * Formate un montant en euros
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  /**
   * Calcule le pourcentage d'adhérents
   */
  getAdherentPercentage(): number {
    if (!this.stats || this.stats.totalUsers === 0) return 0;
    return Math.round((this.stats.totalAdherents / this.stats.totalUsers) * 100);
  }

  /**
   * Calcule le revenu total
   */
  getTotalRevenue(): number {
    if (!this.stats) return 0;
    return this.stats.totalRevenueAdhesions + this.stats.totalRevenueDons;
  }

  /**
   * Obtient les revenus du mois en cours
   */
  getCurrentMonthRevenue(): number {
    if (!this.stats || !this.stats.revenueByMonth) return 0;
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.stats.revenueByMonth[currentMonthKey]?.total || 0;
  }

  /**
   * Obtient le statut d'adhésion avec badge coloré
   */
  getAdhesionStatusBadge(statutAdhesion: string): string {
    switch (statutAdhesion) {
      case 'ACCEPTE': return 'adherent';
      case 'EN_ATTENTE': return 'pending';
      case 'REJETE': return 'rejected';
      default: return 'none';
    }
  }

  /**
   * Formate le statut d'adhésion en français
   */
  formatAdhesionStatus(statutAdhesion: string): string {
    switch (statutAdhesion) {
      case 'ACCEPTE': return 'Adhérent';
      case 'EN_ATTENTE': return 'En attente';
      case 'REJETE': return 'Rejeté';
      case 'NON_DEMANDE': return 'Non demandé';
      default: return statutAdhesion;
    }
  }

  /**
   * Calcule la tendance des nouveaux utilisateurs
   */
  getNewUsersTrend(): string {
    if (!this.stats) return '0%';
    if (this.stats.totalUsers === 0) return '0%';
    const percentage = (this.stats.newUsersThisMonth / this.stats.totalUsers) * 100;
    return `+${percentage.toFixed(1)}%`;
  }

  /**
   * Retourne la couleur selon le montant des dons
   */
  getDonAmountColor(amount: number): string {
    if (amount >= 100) return 'high-donor';
    if (amount >= 50) return 'medium-donor';
    if (amount > 0) return 'low-donor';
    return 'no-donor';
  }
}