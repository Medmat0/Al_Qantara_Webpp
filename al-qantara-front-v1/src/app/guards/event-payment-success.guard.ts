import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { EvenementPaymentService } from '../services/evenement-payment.service';

export const eventPaymentSuccessGuard: CanActivateFn = (route, state) => {
  const evenementPaymentService = inject(EvenementPaymentService);
  
  // Récupérer le token depuis les paramètres de query si présent
  const token = route.queryParams['token'];
  
  // Vérifier si l'accès est autorisé
  const canAccess = evenementPaymentService.canAccessSuccessPage(token);
  
  if (!canAccess) {
    evenementPaymentService.redirectToEvents();
    return false;
  }
  
  return true;
};
