import { Routes } from '@angular/router';
import {NotFoundComponent} from './pages/not-found/not-found.component';

export const routes: Routes = [
  {path: '', loadChildren: () => import('./pages/home/home.routes').then(m => m.default)},
  {path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.default)},
  {path: 'profile', loadChildren: () => import('./pages/profile/profile.routes').then(m => m.default)},
  {path: 'revues', loadChildren: () => import('./pages/revues/revues.routes').then(m => m.default)},
  {path: 'admin', loadChildren: () => import('./pages/admin/admin.routes').then(m => m.default)},
  {path: 'contacts', loadChildren: () => import('./pages/contacts/contacts.routes').then(m => m.default)},
  {path: 'events', loadChildren: () => import('./pages/events/events.routes').then(m => m.default)},
  {path: 'recruitment', loadChildren: () => import('./pages/recruitment/recruitment.routes').then(m => m.default)},
  {path: 'communities', loadChildren: () => import('./pages/community/community.routes').then(m => m.default)},
  {path: 'adhesion', loadChildren: () => import('./pages/adhesion/adhesion.routes').then(m => m.default)},
  {path: 'articles', loadChildren: () => import('./pages/articles/articles.routes').then(m => m.default)},
  {path: 'messaging', loadChildren: () => import('./pages/messaging/messaging.routes').then(m => m.default)},
  {path: 'annuaire', loadChildren: () => import('./pages/annuaire/annuaire.routes').then(m => m.default)},
  {path: 'decouvertes', loadChildren: () => import('./pages/decouverte/decouverte.routes').then(m => m.default)},
  {path: 'not-found', component: NotFoundComponent},
  {path: '**', redirectTo: 'not-found', pathMatch: 'full'},
];
