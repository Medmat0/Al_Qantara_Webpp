import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { API_URL } from '../utils/config';

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private apiUrl = `${API_URL}/auth`; // URL de l'API d'authentification

  constructor(private http: HttpClient) {}


  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/login`, body);
  }



}
