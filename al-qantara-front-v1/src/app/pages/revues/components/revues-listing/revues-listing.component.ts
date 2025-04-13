import { Component, inject } from '@angular/core';
import { RevueService } from '../../../../member/services/revues.service';
import {Router, RouterLink} from '@angular/router';
import {NgForOf} from '@angular/common';
import {RevueItemComponent} from './components/revue-item/revue-item.component';

@Component({
  selector: 'app-revues-listing',
  imports: [RouterLink, NgForOf, RevueItemComponent],
  templateUrl: './revues-listing.component.html',
  standalone: true,
  styleUrls: ['./revues-listing.component.scss']
})
export class RevuesListingComponent {
  // Déclaration des dépendencies
  revueService = inject(RevueService);
  router = inject(Router);

  revues: any[] = [];


  ngOnInit() {
    this.revueService.getAllRevues().subscribe({
      next: (response) => {
        this.revues = response;
        console.log('Revues fetched successfully:', this.revues);
      },
      error: (error) => {
        console.error('Error fetching revues:', error);
      }
    });
  }

  onRevueClick(revue: any): void {
    console.log('Revue clicked:', revue);
    this.router.navigate(['/revues/revue-description/', revue.id]).then(r => console.log(r));

  }
}
