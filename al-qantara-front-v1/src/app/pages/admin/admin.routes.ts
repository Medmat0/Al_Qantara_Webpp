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
      { path: 'revues/add-revue', loadComponent: () => import('../revues/components/addRevue/add-revue.component').then(m => m.AddRevueComponent) },
      { path: 'articles', loadComponent: () => import('./components/articles/articles.component').then(m => m.ArticlesComponent) },
      { path: 'articles/add', loadComponent: () => import('./components/add-article/add-article.component').then(m => m.AddArticleComponent) },
      { path: 'events', loadComponent: () => import('./components/evenements/evenements.component').then(m => m.EvenementsComponent) },
      { path: 'events/add-evenement', loadComponent: () => import('../events/add-evenement/add-evenement.component').then(m => m.AddEvenementComponent) },
      { path: 'events/:id/qr-participation/:utilisateurId', loadComponent: () => import('./components/check-qr-code/check-qr-code.component').then(m => m.CheckQrCodeComponent)},
      { path: 'recruitments', loadComponent: () => import('./components/manage-recruitment/manage-recruitment.component').then(m => m.ManageRecruitmentComponent) },
      { path: 'recruitments/add', loadComponent: () => import('./components/add-recruitment/add-recruitment.component').then(m => m.AddRecruitmentComponent) },
      { path: 'annuaire', loadComponent: () => import('./components/annuaire/admin-annuaire.component').then(m => m.AdminAnnuaireComponent) },
      { path: 'annuaire/add', loadComponent: () => import('./components/annuaire/add-association/add-association.component').then(m => m.AddAssociationComponent) },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {path: 'newsletter', loadComponent: () => import('./components/newsletter/admin-newsletter.component').then(m => m.AdminNewsletterComponent) },
    ]
  }
] as Routes;
