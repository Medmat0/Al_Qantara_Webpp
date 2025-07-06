import {Component, OnInit, ViewChild} from '@angular/core';
import {ConversationsComponent} from '../conversations/conversations.component';
import {ConversationComponent} from '../conversation/conversation.component';
import { MessagerieService } from '../../../../member/services/messagerie.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-messaging-home',
  imports: [ConversationsComponent,ConversationComponent],
  templateUrl: './messaging-home.component.html',
  standalone: true,
  styleUrl: './messaging-home.component.scss'
})
export class MessagingHomeComponent implements OnInit {
  @ViewChild(ConversationsComponent) conversationsComponent!: ConversationsComponent;
  @ViewChild(ConversationComponent) conversationComponent!: ConversationComponent;


  selectedConversation: any = null;

  preloadedMessageInput: string = '';
  preloadedType: string | null = null;
  preloadedEvenementId: number | null = null;

  constructor(
    private messagerieService: MessagerieService,
    private route: ActivatedRoute
  ){
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['destinataireId']) {
        this.selectConversationByUserId(+params['destinataireId']);
      }
      if (params['contenu']) {
        this.preloadedMessageInput = params['contenu'];
        this.preloadedType = params['type'] || null;
        this.preloadedEvenementId = params['evenementId'] ? +params['evenementId'] : null;
      }
    });
  }

  selectConversationByUserId(userId: number) {
    let userIdStr = userId.toString();
    this.messagerieService.getConversationByUserId(userIdStr).subscribe({
      next: (res) => {
        // Récupère l'utilisateur depuis la liste des users (à adapter selon ton code)
        this.messagerieService.getAllUsers().subscribe({
          next: usersRes => {
            const utilisateur = usersRes.data.find((u: any) => u.id === userId);
            const messages = res.data || [];
            this.selectedConversation = {
              utilisateur,
              messages,
              nonLus: 0,
              dernierMessage: messages.length > 0 ? messages[messages.length - 1] : null
            };
            setTimeout(() => {
              if (this.conversationComponent) {
                this.conversationComponent.messageInput = this.preloadedMessageInput;
                this.conversationComponent.preloadedType = this.preloadedType;
                this.conversationComponent.preloadedEvenementId = this.preloadedEvenementId;
              }
            });
          }
        });
      }
    });
  }

  rafraichirConversation() {
    if (this.conversationsComponent) {
      this.conversationsComponent.rafraichirConversations();
    }
  }

}
