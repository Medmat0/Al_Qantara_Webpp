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

  // Méthodes pour la gestion des candidatures
  getApplicantsByOfferId(offerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${offerId}/apply/getall`, {
      withCredentials: true
    });
  }

  updateApplicantStatus(applicantId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/apply/${applicantId}/status`, { status }, {
      withCredentials: true
    });
  }

  scheduleInterview(applicantId: number, meetingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply/${applicantId}/meeting`, meetingData, {
      withCredentials: true
    });
  }

  refuseApplicant(offerId: number, applicantId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${offerId}/refuse/${applicantId}`, {}, {
      withCredentials: true
    });
  }

  acceptApplicant(offerId: number, applicantId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${offerId}/accept/${applicantId}`, {}, {
      withCredentials: true
    });
  }

  // Planifier une réunion Zoom pour une candidature
  scheduleInterviewZoom(offerId: number, applicantId: number, dateEntretien: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${offerId}/zoom/${applicantId}`,
      { dateEntretien },
      { withCredentials: true }
    );
  }
}
