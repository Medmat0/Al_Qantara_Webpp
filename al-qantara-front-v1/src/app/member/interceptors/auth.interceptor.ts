import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthModalService } from '../../services/auth-modal.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authModalService: AuthModalService) {}

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
        // Redirection si l'utilisateur n'est pas authentifié
        if (
          error.status === 401 &&
          error.error &&
          (error.error.message === 'Access token not found in cookies' || error.error === 'Access token not found in cookies')
        ) {
          localStorage.removeItem('utilisateur');
          this.authModalService.showAuthModal();
        }

        return throwError(() => error);
      })
    );
  }
}
