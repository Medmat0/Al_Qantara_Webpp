import {Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import { MessagerieService } from '../../../../member/services/messagerie.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {Input, Output, EventEmitter } from '@angular/core';
import {SocketService} from '../../../../member/services/socket.service';
import {UsersListComponent} from '../users-list/users-list.component';

@Component({
  selector: 'app-conversations',
  imports: [
    NgForOf,
    NgIf,
    DatePipe,
    UsersListComponent
  ],
  templateUrl: './conversations.component.html',
  standalone: true,
  styleUrl: './conversations.component.scss'
})
export class ConversationsComponent implements OnInit, OnDestroy {
  conversations: any[] = [];
  loading = false;
  error: string | null = null;
  @Input() openedConversationUserId: number | null = null;
  @Output() conversationSelected = new EventEmitter<any>();

  private socketListener: any;

  showModal = false;
  users: any[] = [];




  constructor(
    private messagerieService: MessagerieService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.messagerieService.getConversations().subscribe({
      next: (res) => {
        this.conversations = res.data;
        this.loading = false;
        console.log('Conversations loaded:', this.conversations);
        console.log('Structure des données reçues :', res.data);
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des conversations';
        this.loading = false;
      }
    });
    this.registerSocketListener();
  }

  openModal() {
    this.messagerieService.getAllUsers().subscribe({
      next: res => {
        this.users = res.data;
        this.showModal = true;
      }
    });
  }

  handleStartConversation(userId: number) {
    let userIdStr = userId.toString();
    this.showModal = false;
    this.messagerieService.getConversationByUserId(userIdStr).subscribe({
      next: (res) => {
        const utilisateur = this.users.find(u => u.id === userId);
        const messages = res.data || [];
        const conv = {
          utilisateur,
          messages,
          nonLus: 0,
          dernierMessage: messages.length > 0 ? messages[messages.length - 1] : null
        };

        // Ajoute la conversation si elle n'existe pas déjà
        const exists = this.conversations.some(c => c.utilisateur.id === userId);
        if (!exists) {
          this.conversations.unshift(conv);
        }

        this.conversationSelected.emit(conv);
      },
      error: (err) => {
        console.error('Erreur lors de l\'ouverture de la conversation :', err);
      }
    });
  }
  ngOnDestroy(): void {
    if (this.socketListener) {
      this.socketService.socket.off('nouveauMessage', this.socketListener);
    }
  }

  registerSocketListener() {
    if (this.socketListener) {
      this.socketService.socket.off('nouveauMessage', this.socketListener);
    }
    this.socketListener = (data: any) => {
      console.log('Nouveau message reçu via socket:', data);

      const msg = data.message;
      // Cherche la conversation concernée
      const idx = this.conversations.findIndex(conv =>
        conv.utilisateur.id === msg.expediteurId || conv.utilisateur.id === msg.destinataireId
      );
      if (idx !== -1) {
        this.conversations[idx].dernierMessage = msg;
        // Si la conversation n'est pas celle ouverte, incrémente nonLus
        if (this.conversations[idx].utilisateur.id !== this.openedConversationUserId) {
          this.conversations[idx].nonLus = (this.conversations[idx].nonLus || 0) + 1;
        }
        const conv = this.conversations.splice(idx, 1)[0];
        this.conversations.unshift(conv);
      } else {
        this.rafraichirConversations();
      }
    };
    this.socketService.on('nouveauMessage', this.socketListener);
  }

  selectConversation(conv: any) {
    conv.nonLus = 0;
    this.conversationSelected.emit(conv);
    console.log('Conversation sélectionnée :', conv);
  }

  rafraichirConversations() {
    this.loading = true;
    this.messagerieService.getConversations().subscribe({
      next: (res) => {
        this.conversations = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des conversations';
        this.loading = false;
      }
    });
  }


}
