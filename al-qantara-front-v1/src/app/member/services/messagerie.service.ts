import { Injectable } from "@angular/core";
import { API_URL } from "../../utils/config";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, Observable, tap, throwError } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class MessagerieService {
  private readonly apiUrl = `${API_URL}/messages`;
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  getConversations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversations`).pipe(
      tap((response) => {

      }),
      catchError((error) => {
        console.error('Error fetching conversations:', error);
        return throwError(() => new Error('Failed to fetch conversations'));
      })
    );
  }

}
