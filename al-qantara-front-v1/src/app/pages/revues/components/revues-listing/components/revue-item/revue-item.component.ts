import {Component, Input} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {AsyncPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-revue-item',
  imports: [
    NgIf,
    AsyncPipe
  ],
  templateUrl: './revue-item.component.html',
  standalone: true,
  styleUrl: './revue-item.component.scss'
})
export class RevueItemComponent {
  @Input() revue:any;
  private ShowStatsSubject = new BehaviorSubject<boolean>(false);
  protected showRevueStats = this.ShowStatsSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const isAdmin = event.url.startsWith('/admin');
        console.log('is in /admin:', isAdmin);
        this.ShowStatsSubject.next(isAdmin);
      }
    });
  }

  getPreviewUrl(pdfUrl: string): string {
    const onePage = pdfUrl.replace('/upload/', '/upload/pg_1/');
    return onePage.replace('.pdf', '.jpg');
  }



}
