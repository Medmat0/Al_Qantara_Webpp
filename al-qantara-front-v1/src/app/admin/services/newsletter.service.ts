import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {API_URL} from '../../utils/config';


@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private baseUrl = `${API_URL}`;

  constructor(private http: HttpClient) {}

  sendNewsletter(payload: { titre: string; contenu: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/newsletter/envoyer`, payload, { withCredentials: true });
  }

  getSubscribers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/newsletter/abonnes`, { withCredentials: true });
  }

  getHistory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/newsletter/historique`, { withCredentials: true });
  }

  deleteSubscriber(newsletterId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/newsletter/${newsletterId}`, { withCredentials: true });
  }

  updateSubscriberStatus(newsletterId: number, statut: 'ACTIF' | 'INACTIF' | 'DESINSCRIT'): Observable<any> {
    return this.http.patch(`${this.baseUrl}/newsletter/${newsletterId}/statut`, { statut }, { withCredentials: true });
  }
}
