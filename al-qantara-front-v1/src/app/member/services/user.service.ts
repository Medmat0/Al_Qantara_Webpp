import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { API_URL } from '../../utils/config';

export interface UserData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'USER';
  statut: 'ACTIF' | 'INACTIF';
  dateInscription: string;
}

interface UsersResponse {
  message: string;
  users: UserData[];
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${API_URL}/admin/users`;

  constructor(private http: HttpClient) {
    console.log('UserService - API URL:', this.apiUrl);
  }

  getUsers(): Observable<UserData[]> {
    console.log('UserService - Calling getUsers()');
    return this.http.get<UsersResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('UserService - Raw API Response:', response);
      }),
      map(response => {
        if (!response || !Array.isArray(response.users)) {
          console.error('UserService - Invalid response format:', response);
          return [];
        }
        // On laisse la date ISO telle quelle
        return response.users;
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  promoteUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/promote`, {}, {
      withCredentials: true
    });
  }

  demoteUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/demote`, {}, {
      withCredentials: true
    });
  }

  toggleUserStatus(id: string, currentStatus: string): Observable<void> {
    const newStatus = currentStatus === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { statut: newStatus }, {
      withCredentials: true
    });
  }
}
