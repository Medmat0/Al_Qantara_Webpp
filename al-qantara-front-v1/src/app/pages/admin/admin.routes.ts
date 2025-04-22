import { Routes } from '@angular/router';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import {AdminGuard} from '../../member/guards/admin.guard';

export default [
  {
    path: '',
    canActivate:[AdminGuard],
    component: AdminHomeComponent

  }
] as Routes;
