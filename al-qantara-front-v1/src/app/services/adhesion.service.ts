import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {API_URL} from '../utils/config';

@Injectable({
  providedIn: 'root'
})
export class AdhesionService {
  private apiUrl = API_URL;

  constructor(private http: HttpClient) { }

  /**
   * Crée une intention de paiement pour l'adhésion
   * @param utilisateurId ID de l'utilisateur
   * @returns Observable de la réponse HelloAsso
   */
  creerPaiementAdhesion(utilisateurId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/adhesion/checkout`, {
      utilisateurId: utilisateurId
    }, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Checkout adhésion créé:', response);
        // Générer un token de session pour sécuriser l'accès à la page de succès
        this.generatePaymentSessionToken(utilisateurId, 'adhesion');
      }),
      catchError((error) => {
        console.error('Erreur création checkout adhésion:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);
        console.error('URL:', error.url);
        return throwError(() => new Error('Erreur lors de la création du paiement d\'adhésion'));
      })
    );
  }

  /**
   * Crée une intention de paiement pour un don
   * @param montant Montant du don
   * @param utilisateurId ID de l'utilisateur
   * @returns Observable de la réponse HelloAsso
   */
  creerPaiementDon(montant: number, utilisateurId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/adhesion/donation/checkout`, {
      montant: montant,
      utilisateurId: utilisateurId
    }, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Checkout don créé:', response);
        // Générer un token de session pour sécuriser l'accès à la page de succès
        this.generatePaymentSessionToken(utilisateurId, 'don');
      }),
      catchError((error) => {
        console.error('Erreur création checkout don:', error);
        return throwError(() => new Error('Erreur lors de la création du paiement de don'));
      })
    );
  }

  /**
   * Récupère les détails d'une intention de paiement
   * @param checkoutIntentId ID de l'intention de paiement
   * @returns Observable des détails du paiement
   */
  getDetailsCheckout(checkoutIntentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/adhesion/checkout/${checkoutIntentId}`, 
    { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Détails checkout récupérés:', response);
      }),
      catchError((error) => {
        console.error('Erreur récupération détails checkout:', error);
        return throwError(() => new Error('Erreur lors de la récupération des détails'));
      })
    );
  }

  /**
   * Vérifie le statut d'adhésion d'un utilisateur
   * @param utilisateurId ID de l'utilisateur
   * @returns Observable du statut d'adhésion
   */
  verifierStatutAdhesion(utilisateurId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/adhesion/status/${utilisateurId}`, 
    { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Statut adhésion vérifié:', response);
      }),
      catchError((error) => {
        console.error('Erreur vérification statut adhésion:', error);
        return throwError(() => new Error('Erreur lors de la vérification du statut'));
      })
    );
  }

  /**
   * Traite manuellement un paiement (pour les tests)
   * @param utilisateurId ID de l'utilisateur
   * @param type Type de paiement (adhésion ou don)
   * @param montant Montant du paiement (optionnel, requis pour les dons)
   * @returns Observable de la réponse du traitement de paiement
   */
  traiterPaiementManuel(utilisateurId: number, type: string, montant?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/adhesion/process-payment`, {
      utilisateurId: utilisateurId,
      type: type,
      montant: montant
    }, { withCredentials: true });
  }

  /**
   * Crée une adhésion directement (après paiement confirmé)
   * @param utilisateurId ID de l'utilisateur
   * @returns Observable de la réponse de création d'adhésion
   */
  creerAdhesion(utilisateurId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/adhesion/create`, {
      utilisateurId: utilisateurId
    }, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Adhésion créée:', response);
      }),
      catchError((error) => {
        console.error('Erreur création adhésion:', error);
        return throwError(() => new Error('Erreur lors de la création de l\'adhésion'));
      })
    );
  }

  /**
   * Génère un token de session pour sécuriser l'accès à la page de succès
   * @param utilisateurId ID de l'utilisateur
   * @param type Type de paiement
   */
  private generatePaymentSessionToken(utilisateurId: number, type: string): void {
    const timestamp = Date.now();
    const baseString = `${utilisateurId}-${type}-${timestamp}`;
    const token = btoa(baseString);
    
    // Stocker le token avec une expiration de 30 minutes
    const expirationTime = timestamp + (30 * 60 * 1000);
    const tokenData = {
      token: token,
      expires: expirationTime,
      userId: utilisateurId,
      type: type
    };
    
    sessionStorage.setItem('payment_session_token', token);
    sessionStorage.setItem('payment_session_data', JSON.stringify(tokenData));
    
    console.log('🔐 Token de session généré pour:', { utilisateurId, type });
  }

  /**
   * Valide un token de session de paiement
   * @param token Token à valider
   * @param userId ID utilisateur attendu
   * @param type Type de paiement attendu
   * @returns true si le token est valide
   */
  validatePaymentSessionToken(token: string, userId: string, type: string): boolean {
    try {
      const tokenDataStr = sessionStorage.getItem('payment_session_data');
      if (!tokenDataStr) {
        return false;
      }

      const tokenData = JSON.parse(tokenDataStr);
      const now = Date.now();

      // Vérifier l'expiration
      if (now > tokenData.expires) {
        this.clearPaymentSession();
        return false;
      }

      // Vérifier les données
      return tokenData.token === token && 
             tokenData.userId.toString() === userId.toString() && 
             tokenData.type === type;
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return false;
    }
  }

  /**
   * Nettoie la session de paiement
   */
  clearPaymentSession(): void {
    sessionStorage.removeItem('payment_session_token');
    sessionStorage.removeItem('payment_session_data');
  }
}
