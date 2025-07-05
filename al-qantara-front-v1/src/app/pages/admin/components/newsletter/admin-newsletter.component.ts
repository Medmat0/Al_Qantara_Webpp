import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsletterService } from '../../../../admin/services/newsletter.service';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-newsletter',
  templateUrl: './admin-newsletter.component.html',
  styleUrls: ['./admin-newsletter.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AdminNewsletterComponent implements OnInit {
  newsletterForm: FormGroup;
  sending = false;
  sendSuccess: string | null = null;
  sendError: string | null = null;

  subscribers: any[] = [];
  loadingSubscribers = false;
  subscribersError: string | null = null;

  history: any[] = [];
  loadingHistory = false;
  historyError: string | null = null;

  constructor(private fb: FormBuilder, private newsletterService: NewsletterService) {
    this.newsletterForm = this.fb.group({
      titre: ['', Validators.required],
      contenu: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSubscribers();
    this.loadHistory();
  }

  sendNewsletter() {
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

  loadSubscribers() {
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

  loadHistory() {
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
}
