import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 &&
          error.error &&
          (error.error.message === 'Invalid or Expired access Token' || error.error === 'Invalid or Expired access Token')
        ) {
          localStorage.removeItem('utilisateur');
          this.router.navigate(['/']);
        }

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
        // Redirection si l'utilisateur n'est pas authentifié
        if (
          error.status === 401 &&
          error.error &&
          (error.error.message === 'Access token not found in cookies' || error.error === 'Access token not found in cookies')
        ) {
          localStorage.removeItem('utilisateur');
          if (confirm('Veuillez vous connecter pour continuer.')) {

            this.router.navigate(['/auth/login']);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
