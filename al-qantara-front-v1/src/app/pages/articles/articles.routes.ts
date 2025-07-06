import { Routes } from '@angular/router';
import { ArticlesListingComponent } from './components/articles-listing/articles-listing.component';
import { ArticleComponent } from './components/article/article.component';

export const routes: Routes = [
  {
    path: '',
    component: ArticlesListingComponent
  },
  {
    path: ':id',
    component: ArticleComponent
  }
];

export default routes;
