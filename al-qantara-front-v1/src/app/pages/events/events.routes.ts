import {Routes} from '@angular/router';
import {EventHomeComponent} from './event-home/event-home.component';
import {EventDescriptionComponent} from './event-description/event-description.component';
import {PaymentSuccessComponent} from './payment-success/payment-success.component';
import {PaymentCancelComponent} from './payment-cancel/payment-cancel.component';
import {PaymentErrorComponent} from './payment-error/payment-error.component';

export default [
  {path: '', component:EventHomeComponent,},
  {path: 'payment/success', component: PaymentSuccessComponent},
  {path: 'payment/cancel', component: PaymentCancelComponent},
  {path: 'payment/error', component: PaymentErrorComponent},
  {path: ':id', component:EventDescriptionComponent,}
] as Routes;
