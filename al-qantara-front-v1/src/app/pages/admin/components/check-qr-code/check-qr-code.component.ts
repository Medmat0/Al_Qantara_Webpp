import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminEvenementService } from '../../../../admin/services/admin-evenement.service';
import { CommonModule } from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-check-qr-code',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './check-qr-code.component.html',
  styleUrl: './check-qr-code.component.scss'
})
export class CheckQrCodeComponent implements OnInit {
  loading = true;
  errorMessage: string | null = null;
  participation: any = null;
  safeMapUrl: any = null;
  constructor(
    private route: ActivatedRoute,
    private adminEvenementService: AdminEvenementService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    const utilisateurId = Number(this.route.snapshot.paramMap.get('utilisateurId'));

    if (!eventId || !utilisateurId) {
      this.errorMessage = "Paramètres manquants dans l'URL.";
      this.loading = false;
      return;
    }

    this.adminEvenementService.checkQRCodeParticipation(eventId, utilisateurId).subscribe({
      next: (res) => {
        this.participation = res.participation;
        // Génère l’URL de la carte si latitude/longitude présents
        const evt = this.participation?.evenement;
        if (evt?.latitude && evt?.longitude) {
          this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            'https://www.openstreetmap.org/export/embed.html?bbox=' +
            (evt.longitude - 0.01) + ',' +
            (evt.latitude - 0.01) + ',' +
            (evt.longitude + 0.01) + ',' +
            (evt.latitude + 0.01) +
            '&layer=mapnik&marker=' + evt.latitude + ',' + evt.longitude
          );
        } else {
          this.safeMapUrl = null;
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = this.adminEvenementService.errorMessage || 'Une erreur est survenue lors de la vérification du QR code.';
        this.loading = false;
      }
    });
  }
}
