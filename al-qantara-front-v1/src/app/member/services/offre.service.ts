import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, catchError, throwError } from 'rxjs';
import { API_URL } from '../../utils/config';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class OffreService {
  private readonly apiUrl = `${API_URL}/offres`; // URL of the offres API


  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getOffreById(offreId: number): Observable<any> {
    const url = `${this.apiUrl}/${offreId}`;
    return this.http.get(url, {
      withCredentials: true //envoi des credentials et reception cookies
    }).pipe(
      tap((response: any) => {
        console.log('Offre retrieved successfully:', response);
      }),
      catchError((error) => {
        console.error('Error retrieving offre', error);
        return throwError(() => new Error('Failed to retrieve offre'));
      })
    );
  }
}