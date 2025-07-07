import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { Evenement, LikeEvenement } from '../../../member/models/evenement';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { EventModalComponent } from '../event-modal/event-modal.component';
import { EvenementService } from '../../../member/services/evenement.service';
import { AuthService } from '../../../member/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, EventModalComponent],
  templateUrl: './event-calendar.component.html',
  styleUrl: './event-calendar.component.scss'
})
export class EventCalendarComponent implements OnInit {
  @Input() events: Evenement[] = [];
  @Output() eventClick = new EventEmitter<Evenement>();

  // Services
  evenementService = inject(EvenementService);
  authService = inject(AuthService);
  router = inject(Router);

  // Modal properties
  showModal = false;
  selectedEvent: any = null;

  // Modal state properties
  loading = false;
  error = '';
  hasLikedEvenement = false;
  isParticipating = false;
  participation: any = null;
  unsubscribeConfirmed = false;
  isAuthenticated = false;
  userId: number | null = null;

  constructor() {
    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
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

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    locale: 'fr',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: (info) => {
      if (info.event.extendedProps && info.event.extendedProps['type']) {
        info.el.setAttribute('data-type', info.event.extendedProps['type']);
      }
    }
  };

  ngOnInit() {
    this.updateEvents();
  }

  updateEvents() {
    if (this.events) {
      this.calendarOptions.events = this.events.map(event => ({
        id: event.id.toString(),
        title: event.titre,
        start: event.dateDebut,
        end: event.dateFin,
        description: event.description,
        extendedProps: {
          lieu: event.lieu,
          type: event.type,
          placesRestantes: event.placesRestantes,
          originalEvent: event // Store the full event object
        }
      }));
    }
  }

  handleEventClick(info: any) {
    console.log('Event clicked:', info.event);
    const originalEvent = info.event.extendedProps.originalEvent;
    if (originalEvent) {
      this.openModal(originalEvent);
    }
  }

  // Modal methods
  openModal(event: any) {
    this.selectedEvent = event;
    this.showModal = true;
    this.unsubscribeConfirmed = false;
    this.onEvenementClick(event);
  }

  closeModal() {
    this.showModal = false;
    this.selectedEvent = null;
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      confirm('Vous devez être connecté pour interagir avec cet événement');
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }

  onEvenementClick(evenement: Evenement) {
    if(!this.isAuthenticated) {
      return;
    } else {
      this.evenementService.checkParticipation(evenement.id).subscribe({
        next: (res: any) => {
          this.isParticipating = !!res.participation;
          this.participation = res.participation;
        },
        error: (err: any) => {
          this.error = err.message;
          console.error('Erreur lors de la vérification de la participation', err);
        }
      });

      // Vérification du like - utilisation de la méthode likeEvenement pour vérifier
      this.evenementService.likeEvenement(evenement.id).subscribe({
        next: (res: any) => {
          this.hasLikedEvenement = !!res.like;
        },
        error: (err: any) => {
          this.error = err.message;
          console.error('Erreur lors de la vérification du like', err);
        }
      });
    }
  }

  onParticipateToEvenement(evenement: Evenement) {
    if (!this.checkAuthentication()) return;

    this.loading = true;
    this.evenementService.addParticipationToEvenement(evenement.id).subscribe({
      next: (res: any) => {
        this.isParticipating = true;
        this.participation = res.participation;
        this.loading = false;
        alert('Participation confirmée !');
      },
      error: (err: any) => {
        this.error = err.message;
        this.loading = false;
        console.error('Erreur lors de la participation', err);
      }
    });
  }

  onUnsubscribeEvenement(evenement: Evenement) {
    if (!this.checkAuthentication()) return;

    this.loading = true;
    this.evenementService.removeParticipationFromEvenement(evenement.id).subscribe({
      next: (res: any) => {
        this.isParticipating = false;
        this.participation = null;
        this.unsubscribeConfirmed = true;
        this.loading = false;
        alert('Désinscription confirmée !');
      },
      error: (err: any) => {
        this.error = err.message;
        this.loading = false;
        console.error('Erreur lors de la désinscription', err);
      }
    });
  }

  onLikeEvenement(evenement: Evenement) {
    if (!this.checkAuthentication()) return;

    this.evenementService.likeEvenement(evenement.id).subscribe({
      next: (res: any) => {
        this.hasLikedEvenement = !this.hasLikedEvenement;
        if (this.hasLikedEvenement) {
          evenement.likes = evenement.likes || [];
          evenement.likes.push({
            id: res.like.id,
            utilisateurId: this.userId!,
            evenementId: evenement.id,
            dateLike: new Date().toISOString()
          });
        } else {
          evenement.likes = evenement.likes?.filter(like => like.utilisateurId !== this.userId) || [];
        }
      },
      error: (err: any) => {
        this.error = err.message;
        console.error('Erreur lors du like', err);
      }
    });
  }

  onAddComment(evenement: Evenement, commentText: string) {
    if (!this.checkAuthentication()) return;

    this.evenementService.addCommentToEvenement(evenement.id, commentText).subscribe({
      next: (res: any) => {
        evenement.comments = evenement.comments || [];
        evenement.comments.push(res.comment);
        alert('Commentaire ajouté !');
      },
      error: (err: any) => {
        this.error = err.message;
        console.error('Erreur lors de l\'ajout du commentaire', err);
      }
    });
  }
}
