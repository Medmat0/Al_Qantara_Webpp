import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NewsletterService } from '../../../../services/newsletter.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;
  
  // Newsletter state
  newsletterStatus: any = null;
  newsletterLoading = false;
  newsletterMessage: string | null = null;
  newsletterError: string | null = null;

  constructor(
    private http: HttpClient,
    private newsletterService: NewsletterService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.error = null;

    this.http.get<any>('http://localhost:3000/user/profile', { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.user = res.user;
          this.markPastParticipations();
          this.loading = false;
          
          // Charger le statut newsletter une fois que l'utilisateur est chargé
          if (this.user?.email) {
            this.loadNewsletterStatus();
          }
        },
        error: (err) => {
          this.user = null;
          this.error = 'Erreur lors du chargement du profil';
          this.loading = false;
          console.error('Erreur API:', err);
        }
      });
  }

  markPastParticipations(): void {
    if (!this.user?.participations) return;
    const now = new Date();
    this.user.participations.forEach((participation: any) => {
      if (participation.evenement?.dateFin) {
        const dateFin = new Date(participation.evenement.dateFin);
        if (dateFin < now) {
          participation.statut = 'PASSÉ';
        }
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Non défini';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirmé',
      'REFUSE': 'Refusé',
      'ACTIF': 'Actif',
      'INACTIF': 'Inactif'
    };
    
    return statusMap[status] || status;
  }

  getDaysSinceJoined(): number {
    if (!this.user?.dateInscription) return 0;
    
    const joinDate = new Date(this.user.dateInscription);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  getParticipationStats(): { total: number; enAttente: number; confirme: number; refuse: number } {
    if (!this.user?.participations) {
      return { total: 0, enAttente: 0, confirme: 0, refuse: 0 };
    }

    const stats = {
      total: this.user.participations.length,
      enAttente: 0,
      confirme: 0,
      refuse: 0
    };

    this.user.participations.forEach((participation: any) => {
      switch (participation.statut) {
        case 'EN_ATTENTE':
          stats.enAttente++;
          break;
        case 'CONFIRME':
          stats.confirme++;
          break;
        case 'REFUSE':
          stats.refuse++;
          break;
      }
    });

    return stats;
  }

  loadNewsletterStatus(): void {
    if (!this.user?.email) return;
    
    this.newsletterLoading = true;
    this.newsletterError = null;
    
    this.newsletterService.getStatutAbonnement(this.user.email).subscribe({
      next: (res) => {
        this.newsletterStatus = res.data;
        this.newsletterLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du statut newsletter:', err);
        this.newsletterError = 'Erreur lors du chargement du statut newsletter';
        this.newsletterLoading = false;
      }
    });
  }

  seDesabonnerNewsletter(): void {
    if (!this.user?.email) return;
    
    if (confirm('Êtes-vous sûr de vouloir vous désabonner de la newsletter ?')) {
      this.newsletterLoading = true;
      this.newsletterError = null;
      this.newsletterMessage = null;
      
      this.newsletterService.seDesabonner(this.user.email).subscribe({
        next: (res) => {
          this.newsletterMessage = 'Vous avez été désabonné avec succès de la newsletter';
          this.newsletterStatus = { abonne: false, statut: 'DESINSCRIT' };
          this.newsletterLoading = false;
          
          // Effacer le message après 5 secondes
          setTimeout(() => {
            this.newsletterMessage = null;
          }, 5000);
        },
        error: (err) => {
          console.error('Erreur lors du désabonnement:', err);
          this.newsletterError = 'Erreur lors du désabonnement de la newsletter';
          this.newsletterLoading = false;
        }
      });
    }
  }

  sAbonnerNewsletter(): void {
    if (!this.user?.email) return;
    
    this.newsletterLoading = true;
    this.newsletterError = null;
    this.newsletterMessage = null;
    
    this.newsletterService.sAbonner(this.user.email).subscribe({
      next: (res) => {
        this.newsletterMessage = 'Vous avez été abonné avec succès à la newsletter';
        this.newsletterStatus = { abonne: true, statut: 'ACTIF', dateInscription: new Date() };
        this.newsletterLoading = false;
        
        // Effacer le message après 5 secondes
        setTimeout(() => {
          this.newsletterMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Erreur lors de l\'abonnement:', err);
        this.newsletterError = err.error?.message || 'Erreur lors de l\'abonnement à la newsletter';
        this.newsletterLoading = false;
      }
    });
  }
}