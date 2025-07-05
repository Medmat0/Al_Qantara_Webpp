import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessagerieService } from '../../../../member/services/messagerie.service';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {AuthService} from '../../../../member/services/auth.service';

@Component({
  selector: 'app-conversation',
  imports: [
    NgClass,
    DatePipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './conversation.component.html',
  standalone: true,
  styleUrl: './conversation.component.scss'
})
export class ConversationComponent implements OnChanges {
  @Input() conversation: any;
  userId: number | null = null;
  isAuthenticated: boolean = false;

  constructor(private messagerieService: MessagerieService,
              private authService: AuthService,) {

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
      // Appeler la requête seulement si une conversation est sélectionnée
      this.messagerieService.getConversationByUserId(this.conversation.utilisateur.id).subscribe({
        next: (res) => {
          console.log('Données de la conversation reçues :', res);
          this.conversation.messages = res.data || [];},
        error: (err) => {
          console.error('Erreur lors de la récupération des messages de la conversation :', err);
        }
      });
    }
  }

  isCurrentUser(id: number): boolean {
    const currentUserId = this.userId;
    return id === currentUserId;
  }
}
