// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import {API_URL} from '../../utils/config';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public socket: Socket;
  private readonly SOCKET_URL = API_URL;

  // Pour suivre les changements d'état en ligne
  userStatusChanged$ = new BehaviorSubject<any>(null);
  inactiveUsersCleaned$ = new BehaviorSubject<any>(null);

  constructor() {
    this.socket = io(this.SOCKET_URL, {
      withCredentials: true,
    });

    // Connexion
    this.socket.on('connection', () => {
    });

    // Événements entrants
    this.socket.on('userStatusChanged', (data) => {
      this.userStatusChanged$.next(data);
    });

    this.socket.on('inactiveUsersCleaned', (data) => {
      this.inactiveUsersCleaned$.next(data);
    });

    this.socket.on('disconnect', () => {
    });
  }

  updateActivity(userId: string) {
    this.socket.emit('userActivity', userId);
  }

  disconnect() {
    this.socket.disconnect();
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }
}
