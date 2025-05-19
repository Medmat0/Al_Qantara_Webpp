import {Injectable} from '@angular/core';
import {API_URL} from '../../utils/config';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class EvenementService {
  private readonly apiUrl = `${API_URL}/evenements`;
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  getAllEvenements() :Observable<any>{
    return this.http.get(`${this.apiUrl}`).pipe(
      tap((response) => {
        console.log('Fetched events:', response);
      }),
      catchError((error) => {
        console.error('Error fetching events:', error);
        return throwError(() => new Error('Error fetching events'));
      })
    );
  }

  getEvenementById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        console.log('Fetched event:', response);
      }),
      catchError((error) => {
        console.error('Error fetching event:', error);
        return throwError(() => new Error('Error fetching event'));
      })
    );
  }

  addParticipationToEvenement(EvenementId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${EvenementId}/participer`,
      {},
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        console.log('Added participation:', response);
      }),
      catchError((error) => {
        console.error('Error adding participation:', error);
        return throwError(() => new Error('Error adding participation'));
      })
    );
  }

  checkParticipation(EvenementId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${EvenementId}/participation`,
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        console.log('Checked participation:', response);
      }),
      catchError((error) => {
        console.error('Error checking participation:', error);
        return throwError(() => new Error('Error checking participation'));
      })
    );
  }


  removeParticipationFromEvenement(EvenementId:number): Observable<any>{
    return this.http.delete(
      `${this.apiUrl}/${EvenementId}/desinscription`,
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        console.log('Removed participation successfully', response);
      }),
      catchError((error) => {
        console.error('Error removing participation:', error);
        return throwError(() => new Error('Error removing participation'));
      })
    );

  }

  likeEvenement(EvenementId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${EvenementId}/like`,
      {},
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        console.log('Liked event:', response);
      }),
      catchError((error) => {
        console.error('Error liking event:', error);
        return throwError(() => new Error('Error liking event'));
      })
    );
  }
}
