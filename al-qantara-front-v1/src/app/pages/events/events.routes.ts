import {Routes} from '@angular/router';
import {EventHomeComponent} from './event-home/event-home.component';
import {EventDescriptionComponent} from './event-description/event-description.component';

export default [
  {path: '', component:EventHomeComponent,},
  {path: ':id', component:EventDescriptionComponent,}
] as Routes;
