import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { EditArticleComponent } from '../edit-article/edit-article.component';
import { API_URL } from '../../../../utils/config';


interface Article {
  id: number;
  titre: string;
  contenu: string;
  auteur: string;
  datePublication: string;
  revueId: number;
  categories: any[];
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule, EditArticleComponent],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})

export class ArticlesComponent implements OnInit {
  http = inject(HttpClient);
  router = inject(Router);

  articles: Article[] = [];
  searchTerm = '';
  loading = false;
  error = '';
  deletingArticleId: number | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;

  // Filter
  selectedFilter = 'none';
  selectedCategory: string = '';
  categoriesList: string[] = [];

  // Modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  articleToDelete: Article | null = null;

  // --- Edition d'article ---
  showEditModal = false;
  editLoading = false;
  editError = '';
  editSuccess = '';
  articleToEdit: Article | null = null;
  editForm = {
    titre: '',
    contenu: '',
    auteur: '',
    revueId: '',
    categories: [] as any[],
  };

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.loading = true;
    this.error = '';

    this.http.get<any>('${API_URL}/articles', { withCredentials: true }).subscribe({
      next: (response) => {
        this.articles = response.articles || [];
        // Extraire la liste unique des catégories
        const allCategories = this.articles.flatMap(a => a.categories?.map((c: any) => c.nom) || []);
        this.categoriesList = Array.from(new Set(allCategories));
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des articles:', error);
        this.error = 'Une erreur est survenue lors du chargement des articles.';
        this.loading = false;
      }
    });
  }

  onDeleteArticle(article: Article): void {
    this.articleToDelete = article;
    this.modalTitle = 'Confirmation de suppression';
    this.modalMessage = `Êtes-vous sûr de vouloir supprimer l'article "${article.titre}" ?`;
    this.showModal = true;
  }

  confirmModal(): void {
    if (this.articleToDelete) {
      this.deletingArticleId = this.articleToDelete.id;

      this.http.delete(`${API_URL}/articles/${this.articleToDelete.id}`, { withCredentials: true }).subscribe({
        next: () => {
          this.articles = this.articles.filter(a => a.id !== this.articleToDelete?.id);
          this.deletingArticleId = null;
          this.closeModal();

          // Reload current page if it's empty
          if (this.filteredArticles.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.error = 'Une erreur est survenue lors de la suppression de l\'article.';
          this.deletingArticleId = null;
          this.closeModal();
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.articleToDelete = null;
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.currentPage = 1; // Reset to first page when filter changes
  }

  get filteredArticles(): Article[] {
    let filtered: Article[] = Array.isArray(this.articles) ? this.articles : [];

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.titre.toLowerCase().includes(term) ||
        article.auteur.toLowerCase().includes(term) ||
        article.contenu.toLowerCase().includes(term)
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory) {
      filtered = filtered.filter(article =>
        Array.isArray(article.categories) && article.categories.some((cat: any) => cat.nom === this.selectedCategory)
      );
    }

    // Tri
    switch (this.selectedFilter) {
      case 'most-recent':
        filtered = [...filtered].sort((a, b) =>
          new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime()
        );
        break;
      case 'most-old':
        filtered = [...filtered].sort((a, b) =>
          new Date(a.datePublication).getTime() - new Date(b.datePublication).getTime()
        );
        break;
    }

    return filtered;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredArticles.length / this.itemsPerPage);
  }

  get paginatedArticles(): Article[] {
    const startItem = (this.currentPage - 1) * this.itemsPerPage;
    const endItem = startItem + this.itemsPerPage;
    return this.filteredArticles.slice(startItem, endItem);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Méthode pour générer les numéros de page avec ellipses
  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    
    if (totalPages <= 7) {
      // Si moins de 7 pages, montrer toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours montrer la première page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Montrer les pages autour de la page courante
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Toujours montrer la dernière page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }

  // Méthodes pour l'édition d'articles
  onEditArticle(article: Article): void {
    this.articleToEdit = article;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.articleToEdit = null;
  }

  onArticleUpdated(): void {
    // Recharger les articles après une mise à jour
    this.loadArticles();

    // Afficher un message de succès temporaire
    this.editSuccess = 'Article modifié avec succès !';
    setTimeout(() => {
      this.editSuccess = '';
    }, 4000);
  }

  // Méthodes utilitaires
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getArticleExcerpt(content: string): string {
    // Nettoyer le HTML et extraire le texte
    const cleanContent = content.replace(/<[^>]*>/g, '');
    return this.truncateText(cleanContent, 200);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Méthode pour fermer les messages toast
  closeToast(): void {
    this.editSuccess = '';
    this.error = '';
  }
}