import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {API_URL} from '../utils/config';


 
@Injectable({
  providedIn: 'root'
})
export class RemboursementService {

  constructor(private http: HttpClient) {}

  /**
   * Créer une demande de remboursement pour un événement
   */
  demanderRemboursement(evenementId: number, raison: string, rib: string): Observable<any> {
    const body = { raison, rib };
    
    return this.http.post(`${API_URL}/evenements/${evenementId}/demande-remboursement`, body, { 
      withCredentials: true 
    });
  }

  /**
   * Récupérer les demandes de remboursement de l'utilisateur
   */
  getMesDemandesRemboursement(): Observable<any> {
    return this.http.get(`${API_URL}/evenements/mes-remboursements`, { 
      withCredentials: true 
    });
  }
}
