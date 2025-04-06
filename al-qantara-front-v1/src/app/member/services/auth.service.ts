// src/app/member/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, catchError, throwError } from 'rxjs';
import { API_URL } from '../utils/config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_URL}/auth`; // URL of the authentication API
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string | null | undefined, password: string | null | undefined): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/login`, body).pipe(
      tap((response: any) => {
        if (response && response.token) {
          // Store the JWT token and user information in local storage
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.utilisateur));
          console.log('Login successful:', response);
          this.authStatusSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Login failed', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }
  // Register a new user BASIC MEMBER SO BASE ROLE IS USER -----------------------------------------------------------
  register(nom: string | null | undefined, prenom: string | null | undefined, email: string | null | undefined, password: string | null | undefined): Observable<any> {
    // BY DEFAULT ROLE IS USER, IF OTHER ROLE WANTED, LIKE  ADMIN GO THROUGH ADMIN PAGE TO CHANGE ROLE
    const role = 'USER';
    const body = { nom, prenom, email, password, role };
    return this.http.post(`${this.apiUrl}/register`, body).pipe(
      tap((response: any) => {
        if (response && response.token) {
          //if registration succesful, user should verify their email before being able their account

          console.log('Registration successful:', response);
          this.authStatusSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Registration failed', error);
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  logout(): void {
    // Remove the JWT token and user information from local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    console.log('Logout successful');
    this.authStatusSubject.next(false);
    this.router.navigate(['']).then(r => console.log(r));
  }

  //used for dynamic front end like login register and logout buttons in navbar
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  sendVerificationCode(email: string | null | undefined): Observable<any> {
    const body = { email };
    return this.http.post(`${this.apiUrl}/forgotpassword`, body).pipe(
      tap((response: any) => {
        if (response && response.success) {
          // Verification code sent successfully
          console.log('Verification code sent successfully:', response);
        }
      }),
      catchError((error) => {
        console.error('Error sending verification code', error);
        return throwError(() => new Error('Error sending verification code'));
      })
    );
  }

  resetPassword(password: string | null | undefined, accessCode: string | null | undefined): Observable<any> {
    const body = { password, accessCode };
    return this.http.patch(`${this.apiUrl}/changepassword`, body).pipe(
      tap((response: any) => {
        if (response && response.success) {
          // Password reset successfully
          console.log('Password reset successfully:', response);
        }
      }),
      catchError((error) => {
        console.error('Error resetting password', error);
        return throwError(() => new Error('Error resetting password'));
      })
    );
  }
}
