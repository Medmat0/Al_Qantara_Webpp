import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../utils/config';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {
  private apiUrl = `${API_URL}/offres`;

  constructor(private http: HttpClient) { }

  createOffer(offerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, offerData, {
      withCredentials: true
    });
  }

  getAllOffers(): Observable<any> {
    return this.http.get(this.apiUrl, {
      withCredentials: true
    });
  }

  getOfferById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  updateOffer(id: number, offerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, offerData, {
      withCredentials: true
    });
  }

  deleteOffer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
