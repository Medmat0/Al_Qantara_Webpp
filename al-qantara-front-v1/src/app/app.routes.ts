import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: '', loadChildren: () => import('./pages/home/home.routes').then(m => m.default)},
  {path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.default)
  },
  {path: 'articles', loadChildren: () => import('./pages/articles/articles.routes').then(m => m.default)},
  {path: 'contacts', loadChildren: () => import('./pages/contacts/contacts.routes').then(m => m.default)},
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
