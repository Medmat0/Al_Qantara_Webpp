import {Component, Input, OnInit } from '@angular/core';
import {AsyncPipe, NgIf} from '@angular/common';
import { Router } from '@angular/router';

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
export class RevueItemComponent implements OnInit {
  @Input() revue: any;
  protected showStats: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const currentUrl = this.router.url;
    this.showStats =
      currentUrl.startsWith('/admin/revues') || currentUrl === '/admin/revues/remove-revue';
  }

  getPreviewUrl(pdfUrl: string): string {
    const onePage = pdfUrl.replace('/upload/', '/upload/pg_1/');
    return onePage.replace('.pdf', '.jpg');
  }
}

