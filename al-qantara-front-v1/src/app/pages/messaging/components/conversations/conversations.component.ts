import { Component, OnInit } from '@angular/core';
import { MessagerieService } from '../../../../member/services/messagerie.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-conversations',
  imports: [
    NgForOf,
    NgIf,
    DatePipe
  ],
  templateUrl: './conversations.component.html',
  standalone: true,
  styleUrl: './conversations.component.scss'
})
export class ConversationsComponent implements OnInit {
  conversations: any[] = [];
  loading = false;
  error: string | null = null;
  @Output() conversationSelected = new EventEmitter<any>();

  constructor(private messagerieService: MessagerieService) {}

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
  }

  selectConversation(conv: any) {
    this.conversationSelected.emit(conv);
    console.log('Conversation sélectionnée :', conv);
  }


}
