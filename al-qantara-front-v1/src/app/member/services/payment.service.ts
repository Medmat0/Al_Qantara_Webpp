import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../utils/config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  createCheckout(body: any): Observable<any> {
    console.log('[PaymentService] Données envoyées à /evenements/checkout :', body);
    return this.http.post(`${API_URL}/evenements/checkout`, body, { withCredentials: true });
  }
}
