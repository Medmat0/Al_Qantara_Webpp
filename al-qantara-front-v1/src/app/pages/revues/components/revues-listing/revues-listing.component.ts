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
        this.revues = response.map((revue: { datePublication: string }) => {
          const dateRegex = /\d{4}-(\d{2})-(\d{2})/;
          const match = revue.datePublication.match(dateRegex);
          if (match) {
            revue.datePublication = `${match[1]}-${match[2]}`;
          }
          return revue;
        });
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

    switch (this.selectedFilter) {
      case 'les plus récents':
        filtered = filtered.sort((a, b) => new Date(a.datePublication).getTime() - new Date(b.datePublication).getTime());
        break;
      case 'les plus anciens':
        filtered = filtered.sort((a, b) => new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime());
        break;
      case 'les plus populaires':
        filtered = filtered.sort((a, b) => b.nombreVues - a.nombreVues);
        break;
      case 'les plus téléchargés':
        filtered = filtered.sort((a, b) => b.nombreTelechargements - a.nombreTelechargements);
        break;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
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
