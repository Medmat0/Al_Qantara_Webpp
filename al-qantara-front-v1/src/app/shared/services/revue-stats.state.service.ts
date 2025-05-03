import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RevueStatsStateService {
  private showStatsSubject = new BehaviorSubject<boolean>(true);
  showStats$ = this.showStatsSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const hiddenRoutes = ['/revues'];
        const shouldShowStats = !hiddenRoutes.includes(event.url);
        console.log(`NavigationEnd event: ${event.url}, shouldShowStats: ${shouldShowStats}`);
        this.showStatsSubject.next(shouldShowStats);
      }
    });
  }
}
