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


}
