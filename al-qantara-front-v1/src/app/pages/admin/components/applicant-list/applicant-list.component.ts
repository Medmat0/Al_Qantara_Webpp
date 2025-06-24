import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecruitmentService } from '../../services/recruitment.service';
import { DatePipe } from '@angular/common';

interface Applicant {
  id: number;
  offreId: number;
  utilisateurId: number;
  dateCandidature: string;
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE';
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
  imports: [CommonModule, FormsModule],
  providers: [DatePipe]
})
export class ApplicantListComponent implements OnInit, OnChanges {
  @Input() offerId: number | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  applicants: Applicant[] = [];
  loading: boolean = false;
  sortByScoreAsc: boolean = false;

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

  updateStatus(applicantId: number, status: string): void {
    this.recruitmentService.updateApplicantStatus(applicantId, status).subscribe({
      next: () => {
        // Mettre à jour le statut localement
        const applicant = this.applicants.find(a => a.id === applicantId);
        if (applicant) {
          applicant.statut = status as 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE';
        }
      },
      error: (error) => {
        console.error(`Erreur lors de la mise à jour du statut en "${status}":`, error);
      }
    });
  }

  scheduleInterview(applicantId: number): void {
    // Cette fonction pourrait être développée pour ouvrir une autre modale
    // pour planifier un entretien via Zoom ou un autre service
    alert('Fonctionnalité de planification de réunion à implémenter');
  }

  downloadCV(cvUrl: string): void {
    window.open(cvUrl, '_blank');
  }
}
