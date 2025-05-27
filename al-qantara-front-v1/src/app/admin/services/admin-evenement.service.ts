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
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  addEvenement(evenement: Evenement): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, evenement).pipe(
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
    return this.http.put(`${this.apiUrl}/${id}`, evenement).pipe(
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
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        console.log('Deleted event:', response);
      }),
      catchError((error) => {
        console.error('Error deleting event:', error);
        return throwError(() => new Error('Error deleting event'));
      })
    );
  }
}
