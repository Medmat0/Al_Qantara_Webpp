import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: '', loadChildren: () => import('./pages/home/home.routes').then(m => m.default)},
  {path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.default)
  },
  {path: 'profile', loadChildren: () => import('./pages/profile/profile.routes').then(m => m.default)
  },
  { path: 'revues', loadChildren: () => import('./pages/revues/revues.routes').then(m => m.default) },
  { path: 'admin', loadChildren: () => import('./pages/admin/admin.routes').then(m => m.default) },

  {path: 'contacts', loadChildren: () => import('./pages/contacts/contacts.routes').then(m => m.default)},
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
