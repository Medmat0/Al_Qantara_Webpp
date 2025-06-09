import { Injectable } from "@angular/core";
import { API_URL } from "../../utils/config";
import { Observable, catchError, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class CandidatureService {
  private readonly apiUrl = `${API_URL}/offres`;
  
  constructor(
    private http: HttpClient
  ) {}
  
  
  
  addCandidature(offreId: number, cvText:string, lettreMotivation:string): Observable<any> {
    const url = `${this.apiUrl}/${offreId}/apply`;
    const body = {cvText, lettreMotivation};
    return this.http.post(url,body, {
      withCredentials: true //envoi des credentials et reception cookies
    }).pipe(tap((response: any) => {
        if (response) {

          console.log('Candidature ajouté avec succès:', response);
         
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la tentative de candidature', error);
        return new Observable((observer) => {
          observer.error(new Error('Candidature failed'));
        });
      })
     
    );
  }
  
  deleteCandidature(offreId: number): Observable<any> {
    const url = `${this.apiUrl}/${offreId}/apply`;
    return this.http.delete(url, {
      withCredentials: true //envoi des credentials et reception cookies
    }).pipe(tap((response: any) => {
        if (response) {
          console.log('Candidature supprimée avec succès:', response);
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la suppression de la candidature', error);
        return new Observable((observer) => {
          observer.error(new Error('Candidature deletion failed'));
        });
      })
    );
  }
  

}