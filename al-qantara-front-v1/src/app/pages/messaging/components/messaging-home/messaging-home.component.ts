import { Component, ViewChild } from '@angular/core';
import {ConversationsComponent} from '../conversations/conversations.component';
import {ConversationComponent} from '../conversation/conversation.component';
import { MessagerieService } from '../../../../member/services/messagerie.service';

@Component({
  selector: 'app-messaging-home',
  imports: [ConversationsComponent,ConversationComponent],
  templateUrl: './messaging-home.component.html',
  standalone: true,
  styleUrl: './messaging-home.component.scss'
})
export class MessagingHomeComponent {
  @ViewChild(ConversationsComponent) conversationsComponent!: ConversationsComponent;

  selectedConversation: any = null;
  constructor(
    private messagerieService: MessagerieService
  ){
  }

  rafraichirConversation() {
    if (this.conversationsComponent) {
      this.conversationsComponent.rafraichirConversations();
    }
  }

}
