import { Routes } from '@angular/router';
import { AddRevueComponent } from './components/addRevue/add-revue.component';
import {RevuesListingComponent} from './components/revues-listing/revues-listing.component';
import {RevueDescriptionComponent} from './components/revue-description/revue-description.component';

export default [
  {path:'',component:RevuesListingComponent},
  {path:'add-revue',component:AddRevueComponent},
  // DO DYNAMIC Impl later
  { path: 'revue-description/:id', component: RevueDescriptionComponent },
] as Routes;
