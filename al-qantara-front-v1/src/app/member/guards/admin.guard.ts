import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '../../utils/config';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private readonly apiUrl = `${API_URL}/auth`; // URL of the authentication API
  constructor(private http: HttpClient,private router: Router) {}

  canActivate(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-check`, {
      withCredentials: true //envoi des credentials et reception cookies
    }).pipe(tap((response: any) => {
        if (response.authorized) {
        }
        else {
          this.router.navigate(['']);
        }
      }),
      catchError((error) => {
        this.router.navigate(['']);
        return throwError(() => new Error('Error checking user role'));
      })
    );
  }

}
