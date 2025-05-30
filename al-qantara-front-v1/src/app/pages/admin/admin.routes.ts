import { Routes } from '@angular/router';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import {AdminGuard} from '../../member/guards/admin.guard';

export default [
  {
    path: '',
    canActivate:[AdminGuard],
    component: AdminHomeComponent,

    children: [
      { path: 'users', loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent) },
      { path: 'revues', loadComponent: () => import('../revues/components/revues-listing/revues-listing.component').then(m => m.RevuesListingComponent) },
      { path: 'revues/revue-description/:id', loadComponent: () => import('../revues/components/revue-description/revue-description.component').then(m => m.RevueDescriptionComponent)},
      { path: 'revues/add-revue', loadComponent: () => import('../revues/components/addRevue/add-revue.component').then(m => m.AddRevueComponent) },      { path: 'articles', loadComponent: () => import('./components/articles/articles.component').then(m => m.ArticlesComponent) },
      { path: 'articles/add', loadComponent: () => import('./components/add-article/add-article.component').then(m => m.AddArticleComponent) },
      { path: 'events', loadComponent: () => import('./components/evenements/evenements.component').then(m => m.EvenementsComponent) },
      { path: 'events/add-evenement', loadComponent: () => import('../events/add-evenement/add-evenement.component').then(m => m.AddEvenementComponent) },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
] as Routes;
