import {API_URL} from '../../member/utils/config';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {catchError, Observable, tap, throwError} from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class adminRevueService{

  private apiUrl = `${API_URL}/revues/add`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  addRevue(titre: string, description: string, document: File, mois: string, annee: string): Observable<any> {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('document', document);
    formData.append('mois', mois);
    formData.append('annee', annee);
    const headers = {
      Authorization:'Bearer '
    };

    return this.http.post(this.apiUrl, formData, {
      headers: headers,
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
  // TODO: implement the deleteRevue method
  deleteRevue(id: number): any {

  }


}
