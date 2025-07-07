import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticlesService } from '../../../../member/services/articles.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ArticleComponent implements OnInit {
  article: any = null;
  isLoading = true;
  error: string | null = null;
  truncatedContent = '';
  isContentTruncated = false;
  showFullContent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articlesService: ArticlesService
  ) {}

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.loadArticle(+articleId);
    }
  }

  loadArticle(id: number): void {
    this.articlesService.getArticleById(id).subscribe({
      next: (response) => {
        this.article = response.article;
        this.processContent();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de l\'article.';
        this.isLoading = false;
      }
    });
  }

  processContent(): void {
    if (!this.article?.contenu) return;

    if (this.showFullContent) {
      this.truncatedContent = this.article.contenu;
      this.isContentTruncated = false;
    } else {
      const fullContent = this.article.contenu;
      const textContent = fullContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = textContent.split(' ');

      if (words.length > 10) {
        const halfWordCount = Math.floor(words.length / 2);
        const truncatedWords = words.slice(0, halfWordCount);
        truncatedWords.join(' ');
        this.truncatedContent = this.truncateHTMLContent(fullContent, halfWordCount);
        this.isContentTruncated = true;
      } else {
        this.truncatedContent = fullContent;
        this.isContentTruncated = false;
      }
    }
  }

  private truncateHTMLContent(htmlContent: string, maxWords: number): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    let wordCount = 0;
    function processNode(node: Node): boolean {
      if (wordCount >= maxWords) return false;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);

        if (wordCount + words.length <= maxWords) {
          wordCount += words.length;
          return true;
        } else {
          const remainingWords = maxWords - wordCount;
          if (remainingWords > 0) {
            const truncatedText = words.slice(0, remainingWords).join(' ');
            node.textContent = truncatedText;
            wordCount = maxWords;
          }
          return false;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from(node.childNodes);
        for (let child of children) {
          if (!processNode(child)) {
            const nextSiblings = [];
            let nextSibling = child.nextSibling;
            while (nextSibling) {
              nextSiblings.push(nextSibling);
              nextSibling = nextSibling.nextSibling;
            }
            nextSiblings.forEach(sibling => sibling.remove());
            break;
          }
        }
        return wordCount < maxWords;
      }
      return true;
    }

    processNode(tempDiv);
    return tempDiv.innerHTML;
  }

  toggleContent(): void {
    this.showFullContent = !this.showFullContent;
    this.processContent();
  }
  navigateToRevue(): void {
    if (this.article?.revue?.id) {
      this.router.navigate(['/revues/revue-description', this.article.revue.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }
}
