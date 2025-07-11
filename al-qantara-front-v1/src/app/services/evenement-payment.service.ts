import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EvenementPaymentService {
  private readonly SESSION_TOKEN_KEY = 'event_payment_session_token';
  private readonly TOKEN_EXPIRY_KEY = 'event_payment_token_expiry';
  private readonly TOKEN_VALIDITY_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor(private router: Router) {}

  /**
   * Génère un token de session pour sécuriser l'accès à la page de succès
   */
  generateSessionToken(): string {
    const token = this.generateRandomToken();
    const expiry = Date.now() + this.TOKEN_VALIDITY_DURATION;
    
    sessionStorage.setItem(this.SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    
    console.log('🔐 Token de session événement généré:', { token, expiry: new Date(expiry) });
    return token;
  }

  /**
   * Valide le token de session et le supprime après utilisation
   */
  validateAndConsumeToken(providedToken?: string): boolean {
    const storedToken = sessionStorage.getItem(this.SESSION_TOKEN_KEY);
    const storedExpiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    // Nettoyer le token après vérification (usage unique)
    this.clearSessionToken();
    
    if (!storedToken || !storedExpiry) {
      console.log('⚠️ Token de session événement manquant');
      return false;
    }
    
    const now = Date.now();
    const expiryTime = parseInt(storedExpiry);
    
    if (now > expiryTime) {
      console.log('⚠️ Token de session événement expiré');
      return false;
    }
    
    if (providedToken && providedToken !== storedToken) {
      console.log('⚠️ Token de session événement invalide');
      return false;
    }
    
    console.log('✅ Token de session événement validé et consommé');
    return true;
  }

  /**
   * Nettoie le token de session
   */
  clearSessionToken(): void {
    sessionStorage.removeItem(this.SESSION_TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  /**
   * Initie un paiement sécurisé et génère un token
   */
  initiateSecurePayment(): string {
    return this.generateSessionToken();
  }

  /**
   * Vérifie si l'utilisateur peut accéder à la page de succès
   */
  canAccessSuccessPage(token?: string): boolean {
    return this.validateAndConsumeToken(token);
  }

  /**
   * Redirige vers la page d'événements en cas d'accès non autorisé
   */
  redirectToEvents(): void {
    console.log('🔒 Redirection vers /events - accès non autorisé à la page de succès');
    this.router.navigate(['/events']);
  }

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }
}
