import {Component, Input} from '@angular/core';
import {AsyncPipe, NgIf} from '@angular/common';
import {RevueStatsStateService} from '../../../../../../shared/services/revue-stats.state.service';

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
  protected showStats : boolean = false;


  constructor(private revueStatsStateService: RevueStatsStateService) {

  }

  ngOnInit() {
   this.revueStatsStateService.showStats$.subscribe((show) => {
      this.showStats = show;
    });
   }



  getPreviewUrl(pdfUrl: string): string {
    const onePage = pdfUrl.replace('/upload/', '/upload/pg_1/');
    return onePage.replace('.pdf', '.jpg');
  }



}
