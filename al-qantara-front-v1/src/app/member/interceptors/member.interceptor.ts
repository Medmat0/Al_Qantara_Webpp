import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ModalService } from '../services/banishedmodal.service';
import {JoinModalService} from '../services/joinmodal.service';

@Injectable()
export class MemberInterceptor implements HttpInterceptor {
  constructor(private router: Router, private modalService: ModalService, private joinModalService: JoinModalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        // Redirection si non membre de la communauté
        if (
          error.status === 403 &&
          error.error &&
          error.error.message === "Vous n'êtes pas membre de cette communauté, requête impossible"
        ) {
          const match = req.url.match(/communities\/(\d+)/);
          const communityId = match ? match[1] : null;
          this.joinModalService.openJoinModal(communityId); // Passe l'id au service
        }

        if (
          error.status === 403 &&
          error.error &&
          error.error.message === "Vous êtes banni de cette communauté, vous ne pouvez pas continuer "
        ) {
          const match = req.url.match(/communities\/(\d+)/);
          if (match && match[1]) {
            // Utilisation d'une notification personnalisée
            const notificationDiv = document.createElement('div');
            notificationDiv.className = 'custom-notification notification-warning';
            notificationDiv.style.position = 'fixed';
            notificationDiv.style.top = '32px';
            notificationDiv.style.right = '32px';
            notificationDiv.style.zIndex = '9999';
            notificationDiv.style.minWidth = '320px';
            notificationDiv.innerHTML = `
              <div class="notification-content">
                <div class="notification-icon">⚠️</div>
                <div class="notification-message">Vous êtes banni de cette communauté et ne pouvez pas effectuer cette action.</div>
                <button class="notification-close" style="margin-left:16px; background:none; border:none; font-size:18px; cursor:pointer;" onclick="this.parentElement.parentElement.remove()">&times;</button>
              </div>
            `;
            document.body.appendChild(notificationDiv);
            setTimeout(() => {
              notificationDiv.remove();
            }, 5000);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
