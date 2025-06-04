import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminEvenementService } from '../../../../admin/services/admin-evenement.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-check-qr-code',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './check-qr-code.component.html',
  styleUrl: './check-qr-code.component.scss'
})
export class CheckQrCodeComponent implements OnInit {
  loading = true;
  error: string | null = null;
  participation: any = null;

  constructor(
    private route: ActivatedRoute,
    private adminEvenementService: AdminEvenementService
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    const utilisateurId = Number(this.route.snapshot.paramMap.get('utilisateurId'));

    if (!eventId || !utilisateurId) {
      this.error = "Paramètres manquants dans l'URL.";
      this.loading = false;
      return;
    }

    this.adminEvenementService.checkQRCodeParticipation(eventId, utilisateurId).subscribe({
      next: (res) => {
        this.participation = res.participation;
        this.loading = false;
      },
      error: (err) => {
        if (err?.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = "Erreur inconnue lors de la vérification.";
        }
        this.loading = false;
      }
    });
  }
}
