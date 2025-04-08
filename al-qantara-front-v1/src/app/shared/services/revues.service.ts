import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, catchError, throwError } from 'rxjs';

import { Router } from '@angular/router';
import {API_URL} from '../../member/utils/config';
@Injectable({
  providedIn: 'root'
})

export class RevuesService {
  private apiUrl = `${API_URL}/revues`;



  constructor(
    private http :HttpClient,
    private router : Router,
  ) { }

  getRevues(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`).pipe(
      tap((response: any) => {
        console.log('Revues fetched successfully:', response);
      }),
      catchError((error) => {
        console.error('Error fetching revues', error);
        return throwError(() => new Error('Error fetching revues'));
      })
    );
  }

  getRevueById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      tap((response: any) => {
        console.log('Revue fetched successfully:', response);
      }),
      catchError((error) => {
        console.error('Error fetching revue', error);
        return throwError(() => new Error('Error fetching revue'));
      })
    );
  }
}
