import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../member/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Check if user is authenticated in localStorage first
    const userStr = localStorage.getItem('utilisateur');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'ADMIN') {
        return of(true);
      } else {
        console.error('Access denied: Admin role required');
        this.router.navigate(['/']);
        return of(false);
      }
    }

    // If not in localStorage, check with server
    return this.authService.checkAuthStatus().pipe(
      map(response => {
        if (response.authenticated && response.utilisateur?.role === 'ADMIN') {
          return true;
        } else {
          console.error('Access denied: Admin authentication required');
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError(error => {
        console.error('Authentication check failed:', error);
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
