import { Routes } from '@angular/router';
import { RecruitmentListComponent } from './components/recruitment-list/recruitment-list.component';
import {OffreDescriptionComponent} from './components/offre-description/offre-description.component';

export default [
  {
    path: '',
    component: RecruitmentListComponent
  },
  {path: ':id', component:OffreDescriptionComponent}
] as Routes;
