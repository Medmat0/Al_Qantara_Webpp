import { Routes } from '@angular/router';
import { AdhesionComponent } from './adhesion.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentCancelComponent } from './payment-cancel/payment-cancel.component';
import { PaymentErrorComponent } from './payment-error/payment-error.component';
import { PaymentSuccessGuard } from '../../guards/payment-success.guard';

const routes: Routes = [
  { path: '', component: AdhesionComponent },
  { 
    path: 'payment-success', 
    component: PaymentSuccessComponent,
    canActivate: [PaymentSuccessGuard]
  },
  { path: 'payment-cancel', component: PaymentCancelComponent },
  { path: 'payment-error', component: PaymentErrorComponent }
];

export default routes;
