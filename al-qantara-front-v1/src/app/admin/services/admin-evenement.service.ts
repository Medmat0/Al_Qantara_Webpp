import {Injectable} from '@angular/core';
import {API_URL} from '../../utils/config';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Evenement} from '../../member/models/evenement';
import {catchError, Observable, tap, throwError} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AdminEvenementService {
  private readonly apiUrl = `${API_URL}/evenements`;
  errorMessage= '';
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  addEvenement(evenement: Evenement): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, evenement, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Added event:', response);
      }),
      catchError((error) => {
        console.error('Error adding event:', error);
        return throwError(() => new Error('Error adding event'));
      })
    );
  }

  updateEvenement(id: number, evenement: Evenement): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, evenement, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Updated event:', response);
      }),
      catchError((error) => {
        console.error('Error updating event:', error);
        return throwError(() => new Error('Error updating event'));
      })
    );
  }

  deleteEvenement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Deleted event:', response);
      }),
      catchError((error) => {
        this.errorMessage = error.error.message || 'An error occurred while deleting the event.';
        console.error('Error deleting event:', error);
        return throwError(() => error);
      })
    );
  }

  checkQRCodeParticipation(evenementId: number, userId:number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${evenementId}/qr-participation/${userId}`, {withCredentials: true}).pipe(
      tap((response) => {
        console.log('Checked QR code participation:', response);
      }),
      catchError((error) => {
        this.errorMessage = error.error.message || 'An error occurred while checking QR code participation.';
        console.error('Error checking QR code participation:', error);
        return throwError(() => new Error('Error checking QR code participation'));
      })
    );

  }


}
