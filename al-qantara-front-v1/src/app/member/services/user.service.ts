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
  stats?: {
    totalUsers: number;
    totalAdherents: number;
    totalDons: number;
    totalRevenueAdhesions: number;
    totalRevenueDons: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
    newAdherentsThisMonth: number;
    averageDonAmount: number;
    adminCount: number;
    userCount: number;
    adherentCount: number;
    usersOnline: number;
    usersOffline: number;
    revenueByMonth: any;
    recentAdhesions: any[];
    recentDons: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${API_URL}/admin/users`;

  constructor(private http: HttpClient) {
    console.log('UserService - API URL:', this.apiUrl);
  }

  getUsers(): Observable<UsersResponse> {
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
          return {
            message: 'Erreur',
            users: [],
            count: 0,
            stats: undefined
          };
        }
        // Retourner la réponse complète avec les stats
        return response;
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
