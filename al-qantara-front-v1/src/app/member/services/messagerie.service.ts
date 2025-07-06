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

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/utilisateurs`, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('All users fetched successfully:', response);
      }),
      catchError((error) => {
        console.error('Error fetching all users:', error);
        return throwError(() => new Error('Failed to fetch all users'));
      })
    );
  }


  sendMessage(message: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, message, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Message sent successfully:', response);
      }),
      catchError((error) => {
        console.error('Error sending message:', error);
        return throwError(() => new Error('Failed to send message'));
      })
    );
  }

  sendEventMessage(eventId: number, message: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, message, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Event message sent successfully:', response);
      }),
      catchError((error) => {
        console.error('Error sending event message:', error);
        return throwError(() => new Error('Failed to send event message'));
      })
    );
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${messageId}`, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Message deleted successfully:', response);
      }),
      catchError((error) => {
        console.error('Error deleting message:', error);
        return throwError(() => new Error('Failed to delete message'));
      })
    );
  }

  getConversations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversations`, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Conversations fetched successfully:', response);

      }),
      catchError((error) => {
        console.error('Error fetching conversations:', error);
        return throwError(() => new Error('Failed to fetch conversations'));
      })
    );
  }

  getConversationByUserId(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversation/${userId}`, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Conversation fetched successfully:', response);
      }),
      catchError((error) => {
        console.error('Error fetching conversation:', error);
        return throwError(() => new Error('Failed to fetch conversation'));
      })
    );
  }

  marquerMessagesLus(expediteurId:number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vu`, {expediteurId}, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Messages marked as read successfully:', response);
      }),
      catchError((error) => {
        console.error('Error marking messages as read:', error);
        return throwError(() => new Error('Failed to mark messages as read'));
      })
    );
  }

  getUtilisateurs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/utilisateurs`, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Utilisateurs fetched successfully:', response);
      }),
      catchError((error) => {
        console.error('Error fetching utilisateurs:', error);
        return throwError(() => new Error('Failed to fetch utilisateurs'));
      })
    );
  }
  //--------------User STATUS LOGIC--------------------------

  markUserOnline(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/online-status/online`, {}, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('User marked as online successfully:', response);
      }),
      catchError((error) => {
        console.error('Error marking user as online:', error);
        return throwError(() => new Error('Failed to mark user as online'));
      })
    );
  }

  markUserOffline(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/online-status/offline`, {}, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('User marked as offline successfully:', response);
      }),
      catchError((error) => {
        console.error('Error marking user as offline:', error);
        return throwError(() => new Error('Failed to mark user as offline'));
      })
    );
  }

  markUserInactive(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/online-status/inactive`, {}, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('User marked as inactive successfully:', response);
      }),
      catchError((error) => {
        console.error('Error marking user as inactive:', error);
        return throwError(() => new Error('Failed to mark user as inactive'));
      })
    );
  }

  getUsersOnlineStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/online-status/users`, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('Users online status fetched successfully:', response);
      }),
      catchError((error) => {
        console.error('Error fetching users online status:', error);
        return throwError(() => new Error('Failed to fetch users online status'));
      })
    );
  }

  updateUserActivity(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/online-status/activity`, {}, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('User activity updated successfully:', response);
      }),
      catchError((error) => {
        console.error('Error updating user activity:', error);
        return throwError(() => new Error('Failed to update user activity'));
      })
    );
  }

}
