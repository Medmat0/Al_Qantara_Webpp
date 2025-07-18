import { Injectable } from "@angular/core";
import { API_URL, CV_WEB_SERVICE_URL } from "../../utils/config";
import { Observable, catchError, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class CandidatureService {
  private readonly apiUrl = `${API_URL}/offres`;
  private readonly cvWebServiceUrl = `${CV_WEB_SERVICE_URL}`;
  
  constructor(
    private http: HttpClient
  ) {}
  
  
  
  addCandidature(offreId: number, candidatCV: File, experiences:string[], skills:string[], lettreMotivation: string): Observable<any> {
    const url = `${this.apiUrl}/${offreId}/apply`;
    const formData = new FormData();
    formData.append('candidatCV', candidatCV);
    formData.append('experiences', JSON.stringify(experiences));
    formData.append('skills', JSON.stringify(skills));
    formData.append('lettreMotivation', lettreMotivation);

    return this.http.post(url, formData, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response) {
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
  
  checkCandidature(offreId: number): Observable<any> {
    const url = `${this.apiUrl}/${offreId}/apply/check`;
    return this.http.get(url, {
      withCredentials: true //envoi des credentials et reception cookies
    }).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        console.error('Erreur lors de la vérification de la candidature', error);
        return new Observable((observer) => {
          observer.error(new Error('Candidature check failed'));
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

  getJsonFromCVWebService(candidatureFile: File): Observable<any> {
    const url = `${this.cvWebServiceUrl}/cv_parse`;
    const formData = new FormData();
    formData.append('candidatureFile', candidatureFile);

    return this.http.post(url, formData, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des données', error);
        return new Observable((observer) => {
          observer.error(new Error('Data retrieval failed'));
        });
      })
    );
  }
  

}