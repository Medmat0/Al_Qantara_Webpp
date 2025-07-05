import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessagerieService } from '../../../../member/services/messagerie.service';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {AuthService} from '../../../../member/services/auth.service';
import { SocketService } from '../../../../member/services/socket.service';
import {FormsModule} from '@angular/forms';

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
export class ConversationComponent implements OnChanges {
  @Input() conversation: any;
  userId: number | null = null;
  isAuthenticated: boolean = false;
  private socketListener: any;
  messageInput: string = '';


  constructor(private messagerieService: MessagerieService,
              private authService: AuthService,
              private socketService: SocketService) {

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


  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversation'] && this.conversation) {
      this.messagerieService.getConversationByUserId(this.conversation.utilisateur.id).subscribe({
        next: (res) => {
          this.conversation.messages = res.data || [];
        }
      });

      this.registerSocketListener();
    }
  }

  registerSocketListener() {
    if (this.socketListener) {
      this.socketService.socket.off('nouveauMessage', this.socketListener);
    }
    this.socketListener = (data: any) => {
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

  ngOnDestroy(): void {
    if (this.socketListener) {
      this.socketService.socket.off('nouveauMessage', this.socketListener);
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
    const messageData = {
      destinataireId: this.conversation.utilisateur.id,
      contenu: message.trim(),
      type: 'TEXTE'
    };

    this.messagerieService.sendMessage(messageData).subscribe({
      next: (res) => {
        this.socketService.emit('nouveauMessage', { message: res.data });
        this.conversation.messages.push(res.data);
        this.messageInput = '';
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi du message :', err);
      }
    });
  }
}
