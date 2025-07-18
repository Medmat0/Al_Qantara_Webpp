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
          error.error.message === "Vous êtes banni de cette communauté, vous ne pouvez pas continuer"
        ) {
          const match = req.url.match(/communities\/(\d+)/);
          if (match && match[1]) {
            this.modalService.openBanishedModal();
          }
        }

        return throwError(() => error);
      })
    );
  }
}
