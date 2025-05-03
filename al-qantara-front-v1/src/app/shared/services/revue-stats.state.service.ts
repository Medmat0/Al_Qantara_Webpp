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
        const hiddenRoutes =['/revues'];
        this.showStatsSubject.next(!hiddenRoutes.includes(event.url));
      }
    });
  }

}
