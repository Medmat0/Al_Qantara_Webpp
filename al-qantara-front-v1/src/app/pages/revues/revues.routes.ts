import { Routes } from '@angular/router';
import { AddRevueComponent } from './components/addRevue/add-revue.component';
import {RevuesListingComponent} from './components/revues-listing/revues-listing.component';
import {RevueDescriptionComponent} from './components/revue-description/revue-description.component';
import {AdminGuard} from '../../member/guards/admin.guard';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';

export default [
  {path:'',component:RevuesListingComponent},
  {path:'add-revue',canActivate:[AdminGuard],component:AddRevueComponent},
  { path: 'revue-description/:id', component: RevueDescriptionComponent },
  { path: 'pdf-viewer', component: PdfViewerComponent },
] as Routes;
