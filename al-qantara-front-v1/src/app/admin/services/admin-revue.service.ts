import {API_URL} from '../../utils/config';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {catchError, Observable, tap, throwError} from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class adminRevueService{

  private readonly apiUrl = `${API_URL}/revues`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  addRevue(titre: string, description: string, document: File, mois: string, annee: string | null): Observable<any> {
    const url = `${this.apiUrl}/add`;

    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('document', document);
    formData.append('mois', mois);
    formData.append('annee', annee ? annee.toString() : ''); // Convert to string or send an empty string

    return this.http.post(url, formData, {
      withCredentials: true,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap((response) => {
        console.log('Revue added successfully:', response);
      }),
      catchError((error) => {
        console.error('Error adding revue:', error);
        return throwError(() => error);
      })
    );
  }

  deleteRevueById(id: number): Observable<any> {
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.delete(url, { withCredentials: true }).pipe(
      tap(() => {
        console.log(`Revue with ID ${id} deleted successfully.`);
      }),
      catchError((error) => {
        console.error(`Error deleting revue with ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }


}
