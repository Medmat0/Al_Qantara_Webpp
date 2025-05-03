import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, catchError, throwError } from 'rxjs';
import { API_URL } from '../../utils/config';
import { Router } from '@angular/router';
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${API_URL}/auth`; // URL of the authentication API
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatusSubject.asObservable();
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string | null | undefined, password: string | null | undefined): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/login`, body,{
      withCredentials:true //envoi des credentials et reception cookies
    }).pipe(tap((response: any) => {
        if (response.utilisateur) {

          localStorage.setItem('utilisateur', JSON.stringify(response.utilisateur));

          console.log('Login successful:', response);
          this.authStatusSubject.next(true);
        }
      }),
      catchError((error) => {
        this.errorMessage = error.error.message;
        console.error('Login failed', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }


  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true //envoi des credentials et reception cookies
    }).pipe(
      tap(() => {
        localStorage.removeItem('utilisateur');
        this.authStatusSubject.next(false);
        console.log('Logout successful');
      }),
      catchError((error) => {
        console.error('Logout failed', error);
        return throwError(() => new Error('Logout failed'));
      })
    );
  }


  checkAuthStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth-check`, {
      withCredentials: true // Send credentials and receive cookies
    }).pipe(
      tap((response: any) => {
        if (response && response.authenticated === true) {
          localStorage.setItem('utilisateur', JSON.stringify(response.utilisateur));
          console.log('User is authenticated:', response);
          this.authStatusSubject.next(true);
        } else if (response.message === 'Invalid or expired token' && response.authenticated === false) {
          console.error('Invalid or Expired access Token');
          localStorage.removeItem('utilisateur');
          this.logout().subscribe({
            next: () => {
              console.log('User logged out due to invalid or expired token');
              confirm('Your session has expired. Please log in again.');
              this.authStatusSubject.next(false);
              this.router.navigate(['/']); // Redirect to home
            },
            error: (err) => {
              console.error('Error during logout:', err);
            }
          });
          confirm('Your session has expired. Please log in again.');
          }else if (response.message === 'User not authenticated' && response.authenticated === false){
          console.log('User is not authenticated:', response);
          this.authStatusSubject.next(false);
          localStorage.removeItem('utilisateur');
          this.router.navigate(['/']); // Redirect to home
        }
      }),
      catchError((error) => {
        console.error('Error checking authentication status', error);
        this.authStatusSubject.next(false);
        localStorage.removeItem('utilisateur');
        this.router.navigate(['/']); // Redirect to home on error

        return throwError(() => new Error('Error checking authentication status'));
      })
    );
  }
  /*
  refreshAccessToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh-accesstoken`, {}, {
      withCredentials: true //envoi des credentials et reception cookies
    }).pipe(
      tap((response: any) => {
        if (response && response.utilisateur) {
          localStorage.setItem('utilisateur', JSON.stringify(response.utilisateur));
          console.log('Token refreshed successfully:', response);
        }
      }),
      catchError((error) => {
        console.error('Error refreshing token', error);
        return throwError(() => new Error('Error refreshing token'));
      })
    );
  }
   */

  // Register a new user BASIC MEMBER SO BASE ROLE IS USER -----------------------------------------------------------
  register(nom: string | null | undefined, prenom: string | null | undefined, email: string | null | undefined, password: string | null | undefined): Observable<any> {
    // BY DEFAULT ROLE IS USER, IF OTHER ROLE WANTED, LIKE  ADMIN GO THROUGH ADMIN PAGE TO CHANGE ROLE
    const role = 'USER';
    const body = { nom, prenom, email, password, role };
    return this.http.post(`${this.apiUrl}/register`, body).pipe(
      tap((response: any) => {
        if (response) {
          //if registration succesful, user should verify their email before being able their account

          console.log('Registration successful:', response);
        }
      }),
      catchError((error) => {
        this.errorMessage = error.error.message;

        return throwError(() => new Error('Registration failed'));
      })
    );
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

  passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (formGroup) {
        const passwordControl = formGroup.get(password);
        const confirmPasswordControl = formGroup.get(confirmPassword);
        if (passwordControl && confirmPasswordControl) {
          const passwordValue = passwordControl.value;
          const confirmPasswordValue = confirmPasswordControl.value;
          if (passwordValue !== confirmPasswordValue) {
            return { passwordMismatch: true };
          }
        }
      }
      return null;
    };
  }

}
