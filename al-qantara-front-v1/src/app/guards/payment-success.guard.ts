import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../member/services/auth.service';
import { AdhesionService } from '../services/adhesion.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentSuccessGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private adhesionService: AdhesionService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('🛡️ PaymentSuccessGuard - Validation de l\'accès');
    
    // 1. Vérifier l'authentification
    return this.authService.checkAuthStatus().pipe(
      map(authResponse => {
        if (!authResponse.authenticated) {
          console.log('❌ Utilisateur non authentifié');
          this.router.navigate(['/login']);
          return false;
        }

        // 2. Vérifier les paramètres requis
        const queryParams = route.queryParams;
        const type = queryParams['type'];
        const userId = queryParams['userId'] || queryParams['utilisateurId'];
        
        console.log('🔍 Paramètres URL:', { type, userId });

        if (!type || !userId) {
          console.log('❌ Paramètres manquants dans l\'URL');
          this.redirectToAppropriateLocation();
          return false;
        }

        // 3. Vérifier si l'utilisateur correspond
        const currentUser = authResponse.user;
        if (currentUser.id.toString() !== userId.toString()) {
          console.log('❌ ID utilisateur ne correspond pas');
          this.redirectToAppropriateLocation();
          return false;
        }

        // 4. Vérifier la présence d'un token de session de paiement
        const paymentToken = sessionStorage.getItem('payment_session_token');
        
        if (!paymentToken || !this.adhesionService.validatePaymentSessionToken(paymentToken, userId, type)) {
          console.log('❌ Token de session invalide ou manquant');
          this.redirectToAppropriateLocation();
          return false;
        }

        // 5. Nettoyer le token après utilisation (usage unique)
        this.adhesionService.clearPaymentSession();
        
        console.log('✅ Accès autorisé à la page de succès');
        return true;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la vérification:', error);
        this.redirectToAppropriateLocation();
        return of(false);
      })
    );
  }

  private redirectToAppropriateLocation(): void {
    // Rediriger vers une page appropriée selon le contexte
    this.router.navigate(['/']);
  }
}
