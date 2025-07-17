import {ViewChild, ElementRef, Component, Input, OnChanges, SimpleChanges, OnInit} from '@angular/core';
import { MessagerieService } from '../../../../member/services/messagerie.service';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {AuthService} from '../../../../member/services/auth.service';
import { SocketService } from '../../../../member/services/socket.service';
import {FormsModule} from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-conversation',
  imports: [
    NgClass,
    DatePipe,
    NgForOf,
    NgIf,
    FormsModule
  ],
  templateUrl: './conversation.component.html',
  standalone: true,
  styleUrl: './conversation.component.scss'
})
export class ConversationComponent implements OnChanges , OnInit{
  @Input() conversation: any;
  @Output() messageEnvoye = new EventEmitter<any>();

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  userId: number | null = null;
  isAuthenticated: boolean = false;
  private socketListener: any;
  private deleteListener: any; // Nouveau listener pour les suppressions
  messageInput: string = '';
  preloadedType: string | null = null;
  preloadedEvenementId: number | null = null;


  @Input() userStatus: 'EN_LIGNE' | 'HORS_LIGNE' | 'INACTIF' = 'HORS_LIGNE';

  constructor(private messagerieService: MessagerieService,
              private authService: AuthService,
              private socketService: SocketService,
              private router: Router
  ) {

    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
      console.log('Authentication status:', this.isAuthenticated);
      if (status) {
        const user = localStorage.getItem('utilisateur');
        if (user) {
          this.userId = JSON.parse(user).id;
        }
      } else {
        this.userId = null;
      }
    });

    this.socketService.on('userStatusChanged', (data: any) => {
      if (
        this.conversation &&
        data.userId === this.conversation.utilisateur.id
      ) {
        this.userStatus = data.status;
      }
    });


  }

  ngOnInit(): void {
    this.registerSocketListener();
    this.registerDeleteListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversation'] && this.conversation) {
      this.messagerieService.getConversationByUserId(this.conversation.utilisateur.id).subscribe({
        next: (res) => {
          this.conversation.messages = res.data || [];
          setTimeout(() => this.scrollToBottom(), 0);
        }
      });
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  registerSocketListener() {
    if (this.socketListener) {
      this.socketService.socket.off('nouveauMessage', this.socketListener);
    }
    this.socketListener = (data: any) => {
      console.log('Nouveau message reçu via socket:', data);
      if (
        this.conversation &&
        (
          (data.message.expediteurId === this.conversation.utilisateur.id && data.message.destinataireId === this.userId) ||
          (data.message.destinataireId === this.conversation.utilisateur.id && data.message.expediteurId === this.userId)
        )
      ) {
        this.conversation.messages.push(data.message);
      }
    };
    this.socketService.on('nouveauMessage', this.socketListener);
  }

  registerDeleteListener() {
    if (this.deleteListener) {
      this.socketService.socket.off('messageSupprime', this.deleteListener);
    }
    this.deleteListener = (data: any) => {
      console.log('Message supprimé reçu via socket:', data);
      if (this.conversation && this.conversation.messages) {
        // Trouver le message et le marquer comme supprimé au lieu de le supprimer
        const messageIndex = this.conversation.messages.findIndex((msg: any) => msg.id === data.messageId);
        if (messageIndex !== -1) {
          this.conversation.messages[messageIndex] = {
            ...this.conversation.messages[messageIndex],
            estSupprime: true,
            contenu: ' Ce message a été supprimé',
            suppressedBy: data.suppressedBy
          };
        }
      }
    };
    this.socketService.on('messageSupprime', this.deleteListener);
  }

  ngOnDestroy(): void {
    if (this.socketListener) {
      this.socketService.socket.off('nouveauMessage', this.socketListener);
    }
    if (this.deleteListener) {
      this.socketService.socket.off('messageSupprime', this.deleteListener);
    }
  }

  isCurrentUser(id: number): boolean {
    const currentUserId = this.userId;
    return id === currentUserId;
  }

  envoyerMessage(message: string): void {
    if (message.trim() === '') {
      console.warn('Message vide, non envoyé.');
      return;
    }

    // Si un message préchargé de type EVENEMENT doit être envoyé
    const isPreloaded = this.preloadedType === 'EVENEMENT' && this.preloadedEvenementId;
    const messageData = {
      destinataireId: this.conversation.utilisateur.id,
      contenu: message.trim(),
      type: isPreloaded ? 'EVENEMENT' : 'TEXTE',
      evenementId: isPreloaded ? this.preloadedEvenementId : undefined
    };

    this.messagerieService.sendMessage(messageData).subscribe({
      next: (res) => {
        this.socketService.emit('nouveauMessage', { message: res.data });
        this.conversation.messages.push(res.data);
        this.messageInput = '';
        this.messageEnvoye.emit(res.data);

        // Après l’envoi du message préchargé, repasser en mode texte
        if (isPreloaded) {
          this.preloadedType = null;
          this.preloadedEvenementId = null;
        }

        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi du message :', err);
      }
    });
  }

  // Modal properties
  showModal = false;
  modalMessage = '';
  messageToDeleteId: number | null = null;

  deleteMessage(messageId: number): void {
    this.messageToDeleteId = messageId;
    this.modalMessage = 'Êtes-vous sûr de vouloir supprimer ce message ?';
    this.showModal = true;
  }

  confirmModal(): void {
    if (this.messageToDeleteId !== null) {
      this.messagerieService.deleteMessage(this.messageToDeleteId).subscribe({
        next: () => {
          // Marquer le message comme supprimé localement au lieu de le supprimer
          const messageIndex = this.conversation.messages.findIndex(
            (msg: any) => msg.id === this.messageToDeleteId
          );
          if (messageIndex !== -1) {
            this.conversation.messages[messageIndex] = {
              ...this.conversation.messages[messageIndex],
              estSupprime: true,
              contenu: '🗑️ Ce message a été supprimé',
              suppressedBy: this.userId
            };
          }

          // Émettre l'événement Socket.IO pour notifier l'autre utilisateur
          this.socketService.emit('messageSupprime', {
            messageId: this.messageToDeleteId,
            conversationId: `${Math.min(this.userId!, this.conversation.utilisateur.id)}-${Math.max(this.userId!, this.conversation.utilisateur.id)}`,
            suppressedBy: this.userId
          });

          this.closeModal();
        },
        error: (err) => {
          console.error('Error deleting message:', err);
          this.closeModal();
        },
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.messageToDeleteId = null;
  }

  goToSharedEvent(evenementId: number | undefined): void {
    if (evenementId) {
      this.router.navigate(['/events', evenementId]);
    }
  }

  annulerPartageEvenement(): void {
    this.preloadedType = null;
    this.preloadedEvenementId = null;
    this.messageInput = '';
  }
}
