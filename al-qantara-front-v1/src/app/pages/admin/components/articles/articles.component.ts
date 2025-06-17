import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  imports: [CommonModule, FormsModule],
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

  // Modal properties
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  articleToDelete: Article | null = null;

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.loading = true;
    this.error = '';

    this.http.get<any>('http://localhost:3000/articles', { withCredentials: true }).subscribe({
      next: (response) => {
        // Correction : extraire les articles depuis response.articles
        this.articles = response.articles || [];
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

      this.http.delete(`http://localhost:3000/articles/${this.articleToDelete.id}`, { withCredentials: true }).subscribe({
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
          alert('Une erreur est survenue lors de la suppression de l\'article.');
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
    // First apply search filter
    let filtered: Article[] = Array.isArray(this.articles) ? this.articles : [];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.titre.toLowerCase().includes(term) ||
        article.auteur.toLowerCase().includes(term
      ));
    }

    // Then apply sorting
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
    this.currentPage = page;
  }

  editArticle(article: Article): void {
    this.router.navigate(['/admin/articles/edit', article.id]);
  }
}
