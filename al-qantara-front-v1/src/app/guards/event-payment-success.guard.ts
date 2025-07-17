import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { EvenementPaymentService } from '../services/evenement-payment.service';

export const eventPaymentSuccessGuard: CanActivateFn = (route, state) => {
  const evenementPaymentService = inject(EvenementPaymentService);
  
  // Récupérer le token depuis les paramètres de query si présent
  const token = route.queryParams['token'];
  
  if (!token) {
    evenementPaymentService.redirectToEvents();
    return false;
  }
  
  // Vérifier si l'accès est autorisé avec le token
  const canAccess = evenementPaymentService.canAccessSuccessPage(token);
  
  if (!canAccess) {
    evenementPaymentService.redirectToEvents();
    return false;
  }
  
 return true;
};
