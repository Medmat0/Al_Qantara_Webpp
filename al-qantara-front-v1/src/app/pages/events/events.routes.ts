import {Routes} from '@angular/router';
import {EventHomeComponent} from './event-home/event-home.component';

export default [
  {path: '', component:EventHomeComponent,},
  {path: ':id', component:EventHomeComponent,}
] as Routes;
