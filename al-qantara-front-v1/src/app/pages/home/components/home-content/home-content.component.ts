import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ArticlesService } from '../../../../member/services/articles.service';
import { EvenementService } from '../../../../member/services/evenement.service';
import { RevueService } from '../../../../member/services/revue.service';

@Component({
  selector: 'app-home-content',
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './home-content.component.html',
  standalone: true,
  styleUrl: './home-content.component.scss'
})
export class HomeContentComponent implements OnInit {
  articles: any[] = [];
  upcomingEvents: any[] = [];
  latestRevues: any[] = [];
  isLoading = true;

  constructor(
    private articlesService: ArticlesService,
    private evenementService: EvenementService,
    private revueService: RevueService
  ) {}

  ngOnInit() {
    this.loadHomeData();
  }

  private loadHomeData() {
    Promise.all([
      this.loadLatestArticles(),
      this.loadUpcomingEvents(),
      this.loadLatestRevues()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadLatestArticles() {
    return this.articlesService.getAllArticles().subscribe({
      next: (response) => {
        // La réponse contient un objet avec une propriété "articles"
        const articlesArray = response.articles || response;
        // Prendre les 16 derniers articles
        this.articles = articlesArray.slice(-16).reverse();
        console.log('Articles chargés:', this.articles);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des articles:', error);
        this.articles = [];
      }
    });
  }

  private loadUpcomingEvents() {
    return this.evenementService.getAllEvenements().subscribe({
      next: (response) => {
        // Filtrer les événements à venir et prendre les 6 prochains
        const now = new Date();
        this.upcomingEvents = response
          .filter((event: any) => new Date(event.dateDebut) >= now)
          .sort((a: any, b: any) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
          .slice(0, 6);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements:', error);
      }
    });
  }

  private loadLatestRevues() {
    return this.revueService.getAllRevues().subscribe({
      next: (response) => {
        // Prendre les 6 dernières revues
        this.latestRevues = response.slice(-6).reverse();
        console.log('Revues chargées:', this.latestRevues);

        // Debug: afficher les propriétés de chaque revue
        this.latestRevues.forEach((revue, index) => {
          console.log(`Revue ${index}:`, {
            titre: revue.titre,
            mois: revue.mois,
            annee: revue.annee,
            datePublication: revue.datePublication
          });
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des revues:', error);
      }
    });
  }

  scrollCarousel(containerId: string, direction: 'left' | 'right') {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 320; // Largeur d'une carte + margin
      const scrollDirection = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollDirection, behavior: 'smooth' });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) {
      return 'Date non disponible';
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date non disponible';
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Nouvelle méthode pour formater la date des revues au format "mois année"
  formatRevueDate(revue: any): string {
    // Utiliser directement les propriétés mois et annee si disponibles
    if (revue.mois && revue.annee) {
      return `${revue.mois} ${revue.annee}`;
    }

    // Fallback sur datePublication si mois/annee ne sont pas disponibles
    if (revue.datePublication) {
      const date = new Date(revue.datePublication);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('fr-FR', {
          month: 'long',
          year: 'numeric'
        });
      }
    }

    return 'Date non disponible';
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  shouldCenterArticles(): boolean {
    // Centrer les articles s'il y en a 4 ou moins (pas besoin de carousel avec navigation)
    return this.articles.length <= 4;
  }

  getArticleImage(article: any): string {
    // Utiliser l'image de couverture de la revue associée si disponible
    if (article.revue && article.revue.fichier) {
      return this.getPreviewUrl(article.revue.fichier);
    }

    // Vérifier s'il y a une propriété image directe
    if (article.image) {
      return article.image;
    }

    // Si pas d'image, extraire la première image du contenu HTML
    if (article.contenu) {
      const imgRegex = /<img[^>]+src="([^">]+)"/i;
      const match = article.contenu.match(imgRegex);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Image par défaut basée sur la catégorie ou générique
    if (article.categories && article.categories.length > 0) {
      const category = article.categories[0].nom.toLowerCase();
      switch (category) {
        case 'data':
        case 'technologie':
          return '/assets/placeholder-tech.jpg';
        case 'culture':
          return '/assets/placeholder-culture.jpg';
        default:
          return '/assets/placeholder-article.jpg';
      }
    }

    return '/assets/placeholder-article.jpg';
  }

  // Méthode pour convertir l'URL PDF en URL d'image de couverture
  private getPreviewUrl(pdfUrl: string): string {
    const onePage = pdfUrl.replace('/upload/', '/upload/pg_1/');
    return onePage.replace('.pdf', '.jpg');
  }

  getArticleDescription(article: any): string {
    // Si il y a une propriété description directe
    if (article.description) {
      return article.description;
    }

    // Sinon extraire le texte du contenu HTML
    if (article.contenu) {
      // Supprimer les balises HTML et prendre les premiers mots
      const textContent = article.contenu
        .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
        .replace(/\s+/g, ' ')    // Normaliser les espaces
        .trim();

      return textContent;
    }

    return 'Aucune description disponible.';
  }

  getRevueImage(revue: any): string {
    // Utiliser le fichier PDF de la revue pour générer l'URL de l'image de couverture
    if (revue.fichier) {
      return this.getPreviewUrl(revue.fichier);
    }

    // Image par défaut si pas de fichier
    return '/assets/placeholder-revue.jpg';
  }

  // Méthode pour naviguer vers une page et scroller vers le haut
  navigateAndScrollTop(route: string) {
    // Scroller vers le haut immédiatement
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Petite pause puis navigation pour assurer le scroll
    setTimeout(() => {
      window.location.href = route;
    }, 100);
  }
}
