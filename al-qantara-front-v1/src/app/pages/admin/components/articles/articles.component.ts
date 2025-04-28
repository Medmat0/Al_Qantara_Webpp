import { Component } from '@angular/core';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [],
  template: `
    <div class="articles-container">
      <h2>Gestion des Articles</h2>
    </div>
  `,
  styles: [`
    .articles-container {
      padding: 20px;
    }
  `]
})
export class ArticlesComponent {}