import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Association } from '../../../../services/annuaire.service';

@Component({
  selector: 'app-detail-annuaire',
  templateUrl: './detail-annuaire.component.html',
  styleUrls: ['./detail-annuaire.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DetailAnnuaireComponent implements OnInit {
  @Input() association: Association | null = null;
  @Input() isVisible = false;
  @Output() closeModalEvent = new EventEmitter<void>();

  // Toast notification
  showToast = false;
  toastMessage = '';

  ngOnInit(): void {
    // Écouter les touches du clavier
    if (this.isVisible) {
      document.addEventListener('keydown', this.handleKeydown.bind(this));
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.isVisible = false;
    this.closeModalEvent.emit();
  }

  // --- Utilitaires ---
  getSecteurClass(secteur: string | undefined): string {
    if (!secteur) return 'secteur-autre';
    return 'secteur-' + secteur.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  getFormattedAddress(association: Association): string {
    const parts: string[] = [];

    // Ajouter l'adresse si elle existe
    if (association.adresse && association.adresse.trim()) {
      parts.push(association.adresse.trim());
    }

    // Ajouter le code postal et la ville sur une nouvelle ligne ou séparés par une virgule
    const locationParts: string[] = [];
    if (association.codePostal && association.codePostal.trim()) {
      locationParts.push(association.codePostal.trim());
    }
    if (association.ville && association.ville.trim()) {
      locationParts.push(association.ville.trim());
    }

    if (locationParts.length > 0) {
      parts.push(locationParts.join(' '));
    }

    return parts.join(', ') || 'Adresse non renseignée';
  }

  formatWebsiteUrl(url: string | undefined): string {
    if (!url || url.trim() === '') return '';

    const trimmedUrl = url.trim();

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    return `http://${trimmedUrl}`;
  }

  hasSocialLinks(association: Association): boolean {
    return !!(association.siteWeb || association.facebook || association.instagram || association.linkedin || association.twitter);
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAssociationLogo(association: Association): string {
    // Vérifier si le logo existe et n'est pas une URL blob invalide
    if (association.logo &&
        association.logo.trim() !== '' &&
        !association.logo.startsWith('blob:') &&
        association.logo !== 'null' &&
        association.logo !== 'undefined') {
      return association.logo;
    }
    return '/assets/asso_default.png';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/asso_default.png';
    }
  }

  // --- Actions ---
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.showToastMessage('Copié dans le presse-papier !');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      this.showToastMessage('Erreur lors de la copie');
    }
  }

  contactAssociation(): void {
    if (this.association?.email) {
      const subject = encodeURIComponent(`Contact depuis l'annuaire - ${this.association.nom}`);
      const body = encodeURIComponent(`Bonjour,\n\nJe vous contacte depuis l'annuaire Al-Qantara...\n\nCordialement`);
      window.open(`mailto:${this.association.email}?subject=${subject}&body=${body}`);
    }
  }


  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
