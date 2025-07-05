  
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsletterService } from '../../../../admin/services/newsletter.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';

// Interfaces
interface Subscriber {
  email: string;
  dateInscription: Date;
  statut: string;
}

interface NewsletterHistory {
  titre: string;
  dateEnvoi: Date;
  destinataires: number;
  statut: string;
}

@Component({
  selector: 'app-admin-newsletter',
  templateUrl: './admin-newsletter.component.html',
  styleUrls: ['./admin-newsletter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule],
})
export class AdminNewsletterComponent implements OnInit, OnDestroy {
  showNewsletterModal: boolean = false;
  selectedNewsletter: any = null;
  openNewsletterModal(newsletter: any) {
    this.selectedNewsletter = newsletter;
    this.showNewsletterModal = true;
  }

  closeNewsletterModal() {
    this.showNewsletterModal = false;
    this.selectedNewsletter = null;
  }
  editor!: Editor;
  toolbar: Toolbar = [
    [
      'bold', 'italic', 'underline', 'strike',
      'code', 'blockquote', 'ordered_list', 'bullet_list',
      'link', 'image', 'text_color', 'background_color',
      'align_left', 'align_center', 'align_right', 'align_justify',
      'undo', 'redo'
    ]
  ];
  newsletterForm: FormGroup;
  sending = false;
  sendSuccess: string | null = null;
  sendError: string | null = null;

  subscribers: any[] = [];
  loadingSubscribers = false;
  subscribersError: string | null = null;
  subscriberActionError: string | null = null;
  subscriberActionMessage: string | null = null;

  history: any[] = [];
  loadingHistory = false;
  historyError: string | null = null;

  constructor(private fb: FormBuilder, private newsletterService: NewsletterService) {
    this.newsletterForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      contenu: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.loadSubscribers();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  sendNewsletter(): void {
    if (this.newsletterForm.invalid) return;
    
    this.sending = true;
    this.sendSuccess = null;
    this.sendError = null;
    
    this.newsletterService.sendNewsletter(this.newsletterForm.value).subscribe({
      next: (res) => {
        this.sending = false;
        this.sendSuccess = 'Newsletter envoyée avec succès !';
        this.newsletterForm.reset();
        this.loadHistory();
      },
      error: (err) => {
        this.sending = false;
        this.sendError = err?.error?.message || 'Erreur lors de l\'envoi.';
      }
    });
  }
    

  onDeleteSubscriber(id: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Confirmer la suppression de cet abonné ?')) return;
    this.newsletterService.deleteSubscriber(id).subscribe({
      next: () => {
        this.subscriberActionMessage = 'Abonné supprimé avec succès.';
        this.loadSubscribers();
        setTimeout(() => this.subscriberActionMessage = null, 3000);
      },
      error: (err) => {
        this.subscriberActionError = err?.error?.message || 'Erreur lors de la suppression.';
        setTimeout(() => this.subscriberActionError = null, 4000);
      }
    });
  }

  onUpdateStatus(id: number, statut: 'ACTIF' | 'INACTIF' | 'DESINSCRIT', event: Event) {
    event.stopPropagation();
    this.newsletterService.updateSubscriberStatus(id, statut).subscribe({
      next: () => {
        this.subscriberActionMessage = `Statut mis à jour : ${statut}`;
        this.loadSubscribers();
        setTimeout(() => this.subscriberActionMessage = null, 3000);
      },
      error: (err) => {
        this.subscriberActionError = err?.error?.message || 'Erreur lors du changement de statut.';
        setTimeout(() => this.subscriberActionError = null, 4000);
      }
    });
  }
  loadSubscribers(): void {
    this.loadingSubscribers = true;
    this.subscribersError = null;
    
    this.newsletterService.getSubscribers().subscribe({
      next: (res) => {
        this.subscribers = res.data || [];
        this.loadingSubscribers = false;
      },
      error: (err) => {
        this.subscribersError = err?.error?.message || 'Erreur lors du chargement des abonnés.';
        this.loadingSubscribers = false;
      }
    });
  }

  loadHistory(): void {
    this.loadingHistory = true;
    this.historyError = null;
    
    this.newsletterService.getHistory().subscribe({
      next: (res) => {
        this.history = res.data || [];
        this.loadingHistory = false;
      },
      error: (err) => {
        this.historyError = err?.error?.message || 'Erreur lors du chargement de l\'historique.';
        this.loadingHistory = false;
      }
    });
  }

  // TrackBy functions for better performance
  trackByEmail(index: number, subscriber: any): string {
    return subscriber.email;
  }

  trackByTitle(index: number, historyItem: any): string {
    return historyItem.titre;
  }

  // Getters for form validation
  get titre() {
    return this.newsletterForm.get('titre');
  }

  get contenu() {
    return this.newsletterForm.get('contenu');
  }


   
}