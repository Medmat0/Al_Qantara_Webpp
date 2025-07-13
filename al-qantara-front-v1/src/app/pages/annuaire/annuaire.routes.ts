import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./components/public-annuaire/public-annuaire.component').then(m => m.PublicAnnuaireComponent)
  }
] as Routes;
