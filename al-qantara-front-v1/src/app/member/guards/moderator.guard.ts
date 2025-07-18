import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '../../utils/config';

@Injectable({
  providedIn: 'root'
})

export class ModeratorGuard implements CanActivate {
  private readonly apiUrl = `${API_URL}/communities`; // URL of the authentication API

  constructor(private http: HttpClient, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<any> {
    const communityId = route.params['communityId'];
    return this.http.get(`${this.apiUrl}/${communityId}/isModerator`, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response.isModerator) {
        } else {
          this.router.navigate([`/communities/${communityId}`]);
        }
      }),
      catchError((error) => {
        this.router.navigate([`/communities/${communityId}`]);
        return throwError(() => new Error('Error checking user role'));
      })
    );
  }
}
