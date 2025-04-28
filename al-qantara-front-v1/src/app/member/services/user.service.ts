import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user';
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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${API_URL}/admin/users`;

  private mockUsers: UserData[] = [
    {
      id: '1',
      nom: 'EL BARAKA',
      prenom: 'Omar',
      email: 'elbarakaomar@gmail.com',
      role: 'USER',
      statut: 'ACTIF',
      dateInscription: '2024-01-15'
    },
    {
      id: '2',
      nom: 'EL MATROR',
      prenom: 'Yassine',
      email: 'yassine.elmatror@gmail.com',
      role: 'ADMIN',
      statut: 'ACTIF',
      dateInscription: '2024-02-20'
    },
    {
      id: '3',
      nom: 'SUY',
      prenom: 'Benoit',
      email: 'benoitsuy@gmail.com',
      role: 'USER',
      statut: 'INACTIF',
      dateInscription: '2024-03-10'
    }
  ];

  private usersSubject = new BehaviorSubject<UserData[]>(this.mockUsers);

  constructor(private http: HttpClient) {}


 getUsers(): Observable<UserData[]> {
    return this.http.get<UserData[]>(this.apiUrl, {
      withCredentials: true
     });
   }
  /*getUsers(): Observable<UserData[]> {
    return of(this.mockUsers);
  }*/


   deleteUser(id: string): Observable<void> {
     return this.http.delete<void>(`${this.apiUrl}/${id}`, {
     withCredentials: true
   });
   }
  /*deleteUser(id: string): Observable<void> {
    this.mockUsers = this.mockUsers.filter(user => user.id !== id);
    this.usersSubject.next(this.mockUsers);
    return of(void 0);
  }*/


   promoteUser(id: string): Observable<void> {
     return this.http.patch<void>(`${this.apiUrl}/${id}/promote`, {}, {
      withCredentials: true
    });
   }
  /*promoteUser(id: string): Observable<void> {
    const user = this.mockUsers.find(u => u.id === id);
    if (user) {
      user.role = 'ADMIN';
      this.usersSubject.next(this.mockUsers);
    }
    return of(void 0);
  }*/

  demoteUser(id: string): Observable<void> {
   return this.http.patch<void>(`${this.apiUrl}/${id}/demote`, {}, {
       withCredentials: true
    });
   }
  /*demoteUser(id: string): Observable<void> {
    const user = this.mockUsers.find(u => u.id === id);
    if (user) {
      user.role = 'USER';
      this.usersSubject.next(this.mockUsers);
    }
    return of(void 0);
  }
*/

   toggleUserStatus(id: string): Observable<void> {
     return this.http.patch<void>(`${this.apiUrl}/${id}`, {}, {
      withCredentials: true
     });
   }
  /*toggleUserStatus(id: string): Observable<void> {
    const user = this.mockUsers.find(u => u.id === id);
    if (user) {
      user.statut = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
      this.usersSubject.next(this.mockUsers);
    }
    return of(void 0);
  }*/
}
