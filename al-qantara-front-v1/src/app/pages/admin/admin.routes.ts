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
      { path: 'revues/add-revue', loadComponent: () => import('../revues/components/addRevue/add-revue.component').then(m => m.AddRevueComponent) },
      { path: 'revues/remove-revue', loadComponent: () => import('../revues/components/remove-revue/remove-revue.component').then(m => m.RemoveRevueComponent)},
      { path: 'articles', loadComponent: () => import('./components/articles/articles.component').then(m => m.ArticlesComponent) },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
] as Routes;
