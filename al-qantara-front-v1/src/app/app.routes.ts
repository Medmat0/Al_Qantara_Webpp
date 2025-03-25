import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: '', loadChildren: () => import('./pages/home/home.routes').then(m => m.default)},
  {path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.default)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
