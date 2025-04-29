import { Component, inject } from '@angular/core';
import { RevueService } from '../../../../member/services/revue.service';
import { Router, RouterLink } from '@angular/router';
import { NgForOf } from '@angular/common';
import { RevueItemComponent } from './components/revue-item/revue-item.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-revues-listing',
  imports: [RouterLink, NgForOf, RevueItemComponent, FormsModule],
  templateUrl: './revues-listing.component.html',
  standalone: true,
  styleUrls: ['./revues-listing.component.scss']
})
export class RevuesListingComponent {
  revueService = inject(RevueService);
  router = inject(Router);

  revues: any[] = [];
  searchTerm: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 6;

  // Filter properties
  selectedFilter: string = 'none';

  ngOnInit() {
    this.revueService.getAllRevues().subscribe({
      next: (response) => {
        //creation d'un tableau de revues
        this.revues = response;
        console.log('Revues fetched and formatted successfully:', this.revues);

        },
      error: (error) => {
        console.error('Error fetching revues:', error);
      }
    });
  }

  get filteredRevues() {
    let filtered = this.revues.filter(revue =>
      revue.titre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Sort by most recent or most old
    if (this.selectedFilter === 'most-recent') {
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(`${a.annee}-${this.getMonthNumber(a.mois)}-01`);
        const dateB = new Date(`${b.annee}-${this.getMonthNumber(b.mois)}-01`);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
    } else if (this.selectedFilter === 'most-old') {
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(`${a.annee}-${this.getMonthNumber(a.mois)}-01`);
        const dateB = new Date(`${b.annee}-${this.getMonthNumber(b.mois)}-01`);
        return dateA.getTime() - dateB.getTime(); // Ascending order
      });
    } else if(this.selectedFilter==='les plus populaires'){
      filtered = filtered.sort((a, b) => {
        return b.nombreVues - a.nombreVues; // Descending order
      });
    } else if(this.selectedFilter==='les plus téléchargés'){
      filtered = filtered.sort((a, b) => {
        return b.nombreTelechargements - a.nombreTelechargements; // Descending order
      });

    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

// Helper method to convert month name to month number
  getMonthNumber(mois: string): number {
    const moisOrder = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisOrder.indexOf(mois) + 1; // Months are 1-based in Date
  }

  get totalPages() {
    return Math.ceil(
      this.revues.filter(revue =>
        revue.titre.toLowerCase().includes(this.searchTerm.toLowerCase())
      ).length / this.itemsPerPage
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.currentPage = 1; // Reset to the first page when filter changes
  }

  onRevueClick(revue: any): void {
    console.log('Revue clicked:', revue);
    this.router.navigate(['/revues/revue-description/', revue.id]).then(r => console.log(r));
  }
}
