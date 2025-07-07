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
      }),
      catchError((error) => {
        console.error('Erreur création checkout adhésion:', error);
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
}
