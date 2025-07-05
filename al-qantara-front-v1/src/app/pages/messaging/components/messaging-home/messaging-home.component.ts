import { Component } from '@angular/core';
import {ConversationsComponent} from '../conversations/conversations.component';
import {ConversationComponent} from '../conversation/conversation.component';

@Component({
  selector: 'app-messaging-home',
  imports: [ConversationsComponent,ConversationComponent],
  templateUrl: './messaging-home.component.html',
  standalone: true,
  styleUrl: './messaging-home.component.scss'
})
export class MessagingHomeComponent {

  selectedConversation: any = null;

}
