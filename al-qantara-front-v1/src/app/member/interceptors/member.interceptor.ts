import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ModalService } from '../services/banishedmodal.service';

@Injectable()
export class MemberInterceptor implements HttpInterceptor {
  constructor(private router: Router, private modalService: ModalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        // Redirection si non membre de la communauté
        if (
          error.status === 403 &&
          error.error &&
          error.error.message === "Vous n'êtes pas membre de cette communauté, requête impossible"
        ) {
          // Extraction de l'id de la communauté depuis l'URL
          const match = req.url.match(/communities\/(\d+)/);
          if (match && match[1]) {
            const communityId = match[1];
            if (confirm('Vous devez être membre de cette communauté pour y accéder. Voulez-vous rejoindre la communauté ?')) {
              this.router.navigate(['/communities', communityId]);
            }
          }
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
