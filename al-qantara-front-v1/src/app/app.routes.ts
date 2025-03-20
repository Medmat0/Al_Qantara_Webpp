import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: async () => {
      const m = await import('./home/home.component');
      return m.HomeComponent;
    },
  },
  { path: 'auth', loadChildren: () => import('./modules/auth/auth.routes').then(m => m.default) },  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
