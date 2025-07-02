
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RequestFormComponent } from '../request-form/request-form.component';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, RequestFormComponent, FormsModule],
  templateUrl: './contacts.component.html',
  standalone: true,
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements AfterViewInit {
  userMessage: string = '';
  messages: { from: 'user' | 'bot' | 'typing', text: string }[] = [
    { from: 'bot', text: 'Bonjour ! Je suis le bot de l’association. Posez-moi vos questions.' }
  ];
  isTyping: boolean = false;

  @ViewChild('chatbotMessages') chatbotMessagesRef!: ElementRef;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.scrollToBottom();
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
}
