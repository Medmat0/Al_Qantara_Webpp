import { Routes } from '@angular/router';
import { AddRevueComponent } from './components/addRevue/add-revue.component';
import {RevuesListingComponent} from './components/revues-listing/revues-listing.component';
import {RevueDescriptionComponent} from './components/revue-description/revue-description.component';
import {AdminGuard} from '../../member/guards/admin.guard';

export default [
  {path:'',component:RevuesListingComponent},
  {path:'add-revue',canActivate:[AdminGuard],component:AddRevueComponent},
  { path: 'revue-description/:id', component: RevueDescriptionComponent },
] as Routes;
