import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {API_URL} from '../utils/config';


@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private apiUrl = API_URL;

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
