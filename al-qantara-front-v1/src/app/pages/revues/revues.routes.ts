import { Routes } from '@angular/router';
import { AddRevueComponent } from './components/addRevue/add-revue.component';
import {RevuesListingComponent} from './components/revues-listing/revues-listing.component';

export default [
  {path:'',component:RevuesListingComponent},
  {path:'add-revue',component:AddRevueComponent},

] as Routes;
