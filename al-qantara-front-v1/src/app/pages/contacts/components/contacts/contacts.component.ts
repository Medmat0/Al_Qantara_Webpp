import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RequestFormComponent } from '../request-form/request-form.component';
import { NewsletterService } from '../../../../services/newsletter.service';
import { Router } from '@angular/router';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut: string;
}

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, RequestFormComponent, FormsModule],
  templateUrl: './contacts.component.html',
  standalone: true,
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit, AfterViewInit {
  userMessage: string = '';
  messages: { from: 'user' | 'bot' | 'typing', text: string }[] = [
    { from: 'bot', text: 'Bonjour ! Je suis le bot de l’association. Posez-moi vos questions.' }
  ];
  isTyping: boolean = false;

  // Utilisateur connecté
  utilisateur: Utilisateur | null = null;
  isConnected: boolean = false;

  // Newsletter
  isSubscribing: boolean = false;
  subscriptionMessage: string = '';
  subscriptionSuccess: boolean = false;
  isAlreadySubscribed: boolean = false;
  checkingSubscription: boolean = false;

  @ViewChild('chatbotMessages') chatbotMessagesRef!: ElementRef;

  constructor(
    private http: HttpClient, 
    private newsletterService: NewsletterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserConnection();
    // Vérifier le statut d'abonnement si l'utilisateur est connecté
    if (this.isConnected && this.utilisateur?.email) {
      this.checkNewsletterSubscription();
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  checkUserConnection(): void {
    const userStr = localStorage.getItem('utilisateur');
    if (userStr) {
      try {
        this.utilisateur = JSON.parse(userStr);
        this.isConnected = true;
        // Vérifier l'abonnement newsletter après avoir récupéré l'utilisateur
        if (this.utilisateur?.email) {
          this.checkNewsletterSubscription();
        }
      } catch (e) {
        this.utilisateur = null;
        this.isConnected = false;
      }
    } else {
      this.utilisateur = null;
      this.isConnected = false;
    }
  }

  checkNewsletterSubscription(): void {
    if (!this.utilisateur?.email) return;
    
    this.checkingSubscription = true;
    this.newsletterService.getStatutAbonnement(this.utilisateur.email).subscribe({
      next: (response) => {
        this.isAlreadySubscribed = response.data?.abonne || false;
        this.checkingSubscription = false;
      },
      error: (error) => {
        console.error('Erreur lors de la vérification de l\'abonnement:', error);
        this.isAlreadySubscribed = false;
        this.checkingSubscription = false;
      }
    });
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isTyping) return;
    const message = this.userMessage.trim();
    this.messages.push({ from: 'user', text: message });
    this.userMessage = '';
    this.isTyping = true;
    this.messages.push({ from: 'typing', text: 'Le bot est en train d’écrire...' });
    this.scrollToBottom();

    this.http.post<{ response: string }>('http://localhost:8000/chatbot/ask', { message })
      .subscribe({
        next: (res) => {
          this.removeTyping();
          this.messages.push({ from: 'bot', text: res.response || 'Réponse indisponible.' });
          this.isTyping = false;
          this.scrollToBottom();
        },
        error: () => {
          this.removeTyping();
          this.messages.push({ from: 'bot', text: 'Erreur de connexion au bot.' });
          this.isTyping = false;
          this.scrollToBottom();
        }
      });
  }

  removeTyping() {
    const idx = this.messages.findIndex(m => m.from === 'typing');
    if (idx !== -1) this.messages.splice(idx, 1);
  }

  scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById('chatbot-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  sAbonnerNewsletter() {
    // Vérifier si l'utilisateur est connecté
    if (!this.isConnected || !this.utilisateur?.email) {
      this.subscriptionMessage = 'Vous devez être connecté pour vous abonner à la newsletter.';
      this.subscriptionSuccess = false;
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        this.redirectToLogin();
      }, 2000);
      return;
    }

    // Vérifier si déjà abonné
    if (this.isAlreadySubscribed) {
      this.subscriptionMessage = 'Vous êtes déjà abonné(e) à notre newsletter.';
      this.subscriptionSuccess = true;
      return;
    }

    this.isSubscribing = true;
    this.subscriptionMessage = '';

    this.newsletterService.sAbonner(this.utilisateur.email).subscribe({
      next: (response) => {
        this.subscriptionMessage = `Merci ${this.utilisateur?.prenom} ! Vous êtes maintenant abonné(e) à notre newsletter.`;
        this.subscriptionSuccess = true;
        this.isSubscribing = false;
        this.isAlreadySubscribed = true; // Mettre à jour le statut local
      },
      error: (error) => {
        console.error('Erreur lors de l\'abonnement:', error);
        if (error.status === 409) {
          this.subscriptionMessage = 'Vous êtes déjà abonné(e) à notre newsletter.';
          this.isAlreadySubscribed = true; // Mettre à jour le statut local
        } else {
          this.subscriptionMessage = error.error?.message || 'Erreur lors de l\'abonnement. Veuillez réessayer.';
        }
        this.subscriptionSuccess = false;
        this.isSubscribing = false;
      }
    });
  }

  redirectToLogin() {
    this.router.navigate(['/auth/login']);
  }

  // Méthode publique pour rediriger vers la page de connexion

}
