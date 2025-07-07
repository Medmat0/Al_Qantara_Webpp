import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private apiUrl = 'http://localhost:3000'; // URL de base de l'API

  constructor(private http: HttpClient) { }

  sAbonner(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/newsletter/s-abonner`, { email });
  }

  getStatutAbonnement(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/newsletter/statut-email/${encodeURIComponent(email)}`);
  }

  seDesabonner(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/newsletter/desinscription-email/${encodeURIComponent(email)}`);
  }
}
