import { Component, inject } from '@angular/core';
import { RevueService } from '../../../../member/services/revue.service';
import { Router } from '@angular/router';
import { NgForOf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RevueItemComponent } from '../revues-listing/components/revue-item/revue-item.component';
import {adminRevueService} from '../../../../admin/services/admin-revue.service';

@Component({
  selector: 'app-remove-revue',
  imports: [
    CommonModule, // Import CommonModule to use *ngFor and *ngIf
    FormsModule,
    RevueItemComponent
  ],
  templateUrl: './remove-revue.component.html',
  standalone: true,
  styleUrl: './remove-revue.component.scss'
})
export class RemoveRevueComponent {
  revueService = inject(RevueService);
  adminRevueService = inject(adminRevueService);
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

  onDeleteRevue(revueId: number): void {
    if (confirm('Are you sure you want to delete this revue?')) {
      this.adminRevueService.deleteRevueById(revueId).subscribe({
        next: () => {
          this.revues = this.revues.filter(revue => revue.id !== revueId);
          console.log('Revue deleted successfully.');
        },
        error: (error) => {
          console.error('Error deleting revue:', error);
          alert('An error occurred while deleting the revue.');
        }
      });
    }
  }
}
