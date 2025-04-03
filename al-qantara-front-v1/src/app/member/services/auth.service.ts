import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import { API_URL } from '../utils/config';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private apiUrl = `${API_URL}/auth`; // URL de l'API d'authentification

  constructor(
    private http: HttpClient,
    private  router:Router
  ) {}


  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/login`, body).pipe(
      tap((response: any) => {
        if (response && response.token) {
          // Stocker le token JWT dans le stockage local
          localStorage.setItem('auth_token', response.token);
          console.log('Login successful:', response);
        }
      })
    );
  }

  logout(): void {
    // Supprimer le token JWT du stockage local
    localStorage.removeItem('auth_token');
    console.log('Logout successful');
    this.router.navigate(['']).then(r => console.log(r));

  }

}
