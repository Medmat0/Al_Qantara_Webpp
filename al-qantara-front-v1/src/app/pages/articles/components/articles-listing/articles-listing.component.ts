import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlesService } from '../../../../member/services/articles.service';
import { Article } from '../../../../member/models/article';
import { FormsModule } from '@angular/forms';
import { Categorie } from '../../../../member/models/categorie';

@Component({
  selector: 'app-articles-listing',
  templateUrl: './articles-listing.component.html',
  styleUrls: ['./articles-listing.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ArticlesListingComponent implements OnInit {
  articles: Article[] = [];
  categories: Categorie[] = [];
  filteredArticles: Article[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  isLoading = true;
  error: string | null = null;

  constructor(private articlesService: ArticlesService) {}

  ngOnInit(): void {
    this.articlesService.getAllArticles().subscribe({
      next: (res) => {
        this.articles = res.articles || [];
        this.filteredArticles = this.articles;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des articles.';
        this.isLoading = false;
      },
    });
    this.articlesService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.categories || [];
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchTerm.toLowerCase();
    this.filteredArticles = this.articles.filter(article => {
      const matchTitre = article.titre.toLowerCase().includes(search);
      const matchAuteur = article.auteur.toLowerCase().includes(search);
      // Recherche sur les catégories (noms)
      const matchCategorie = article.categories && article.categories.some(cat => cat.nom.toLowerCase().includes(search));
      // Filtre par catégorie sélectionnée
      const matchCatFilter = this.selectedCategory ? (article.categories && article.categories.some(cat => cat.nom === this.selectedCategory)) : true;
      return (matchTitre || matchAuteur || matchCategorie) && matchCatFilter;
    });
  }

  getPreviewUrl(pdfUrl: string): string {
    if (!pdfUrl) return '';
    const onePage = pdfUrl.replace('/upload/', '/upload/pg_1/');
    return onePage.replace('.pdf', '.jpg');
  }
}
