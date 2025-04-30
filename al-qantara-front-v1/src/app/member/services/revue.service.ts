import {Injectable} from '@angular/core';
import {API_URL} from '../../utils/config';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, tap, throwError} from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class RevueService {
  private readonly apiUrl = `${API_URL}/revues`;
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getAllRevues(): Observable<any> {
    return this.http.get(`${this.apiUrl}`).pipe(
      tap((response) => {
        console.log('Fetched revues:', response);
      }),
      catchError((error) => {
        console.error('Error fetching revues:', error);
        return throwError(() => new Error('Error fetching revues'));
      })
    );
  }

  getRevueById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
        console.log('Fetched revue:', response);
      }),
      catchError((error) => {
        console.error('Error fetching revue:', error);
        return throwError(() => new Error('Error fetching revue'));
      })
    );
  }

  addVueToRevue(revueId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${revueId}/view`, {}).pipe(
      tap((response) => {
        console.log('Added view to revue:', response);
      }),
      catchError((error) => {
        console.error('Error adding view to revue:', error);
        return throwError(() => new Error('Error adding view to revue'));
      })
    );
  }

  addDownloadToRevue(revueId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${revueId}/download`, {}).pipe(
      tap((response) => {
        console.log('Added download to revue:', response);
      }),
      catchError((error) => {
        console.error('Error adding download to revue:', error);
        return throwError(() => new Error('Error adding download to revue'));
      })
    );
  }


}
