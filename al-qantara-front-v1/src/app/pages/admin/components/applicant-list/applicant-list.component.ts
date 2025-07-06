import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruitmentService } from '../../services/recruitment.service';
import { DatePipe } from '@angular/common';
import { CvViewerComponent } from '../cv-viewer/cv-viewer.component';

interface Applicant {
  id: number;
  offreId: number;
  utilisateurId: number;
  dateCandidature: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REJETEE';
  cv: string;
  score: number;
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

@Component({
  selector: 'app-applicant-list',
  templateUrl: './applicant-list.component.html',
  styleUrls: ['./applicant-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, CvViewerComponent],
  providers: [DatePipe]
})
export class ApplicantListComponent implements OnInit, OnChanges {
  @Input() offerId: number | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  applicants: Applicant[] = [];
  loading: boolean = false;
  sortByScoreAsc: boolean = false;

  // Pour la planification de réunion
  showMeetingModal: boolean = false;
  meetingDate: string = '';
  meetingApplicantId: number | null = null;
  meetingError: string = '';

  showCvViewer: boolean = false;
  currentCvUrl: string = '';
  currentApplicantName: string = '';

  constructor(
    private recruitmentService: RecruitmentService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (this.isVisible && this.offerId) {
      this.loadApplicants();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isVisible'] || changes['offerId']) && this.isVisible && this.offerId) {
      this.loadApplicants();
    }
  }

  loadApplicants(): void {
    if (!this.offerId) return;

    this.loading = true;
    this.recruitmentService.getApplicantsByOfferId(this.offerId).subscribe({
      next: (response: Applicant[]) => {
        this.applicants = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des candidats:', error);
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }

  sortByScore(): void {
    this.sortByScoreAsc = !this.sortByScoreAsc;
    this.applicants.sort((a, b) => {
      return this.sortByScoreAsc ? a.score - b.score : b.score - a.score;
    });
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return '';
    return this.datePipe.transform(dateString, 'dd-MM-yyyy') || '';
  }

  getScoreColorClass(score: number): string {
    if (score >= 80) return 'score-dark-green';
    if (score >= 60) return 'score-light-green';
    if (score > 50) return 'score-yellow';
    return 'score-red';
  }


  scheduleInterview(applicantId: number): void {
    this.meetingApplicantId = applicantId;
    this.meetingDate = '';
    this.meetingError = '';
    this.showMeetingModal = true;
  }

  closeMeetingModal(): void {
    this.showMeetingModal = false;
    this.meetingApplicantId = null;
    this.meetingDate = '';
    this.meetingError = '';
  }

  planifierReunion(): void {
    if (!this.offerId || !this.meetingApplicantId || !this.meetingDate) {
      this.meetingError = 'Veuillez choisir une date et une heure.';
      return;
    }
    // Formatage ISO sans secondes ni millisecondes, puis ajout .000
    const dateEntretien = new Date(this.meetingDate).toISOString().slice(0, 19) + '.000';
    this.recruitmentService.scheduleInterviewZoom(this.offerId, this.meetingApplicantId, dateEntretien).subscribe({
      next: () => {
        this.closeMeetingModal();
        alert('Réunion planifiée avec succès !');
      },
      error: (err) => {
        this.meetingError = 'Erreur lors de la planification de la réunion.';
        console.error(err);
      }
    });
  }

  downloadCV(cvUrl: string): void {
    window.open(cvUrl, '_blank');
  }

  refuseApplicant(applicantId: number): void {
    if (!this.offerId) return;
    this.recruitmentService.refuseApplicant(this.offerId, applicantId).subscribe({
      next: () => {
        const applicant = this.applicants.find(a => a.id === applicantId);
        if (applicant) {
          applicant.statut = 'REJETEE';
        }
      },
      error: (error) => {
        alert('Erreur lors du refus de la candidature.');
        console.error('Erreur lors du refus:', error);
      }
    });
  }

  accepteApplicant(applicantId: number): void {
    if (!this.offerId) return;
    this.recruitmentService.acceptApplicant(this.offerId, applicantId).subscribe({
      next: () => {
        const applicant = this.applicants.find(a => a.id === applicantId);
        if (applicant) {
          applicant.statut = 'ACCEPTEE';
        }
      },
      error: (error) => {
        alert('Erreur lors de l\'acceptation de la candidature.');
        console.error('Erreur lors de l\'acceptation:', error);
      }
    });
  }

  openCvViewer(cvUrl: string, applicantName: string): void {
    this.currentCvUrl = cvUrl;
    this.currentApplicantName = applicantName;
    this.showCvViewer = true;
  }

  closeCvViewer(): void {
    this.showCvViewer = false;
    this.currentCvUrl = '';
    this.currentApplicantName = '';
  }
}
