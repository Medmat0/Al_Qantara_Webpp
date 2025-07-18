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
        this.revues = response;

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


  onDeleteRevue(revueId: number): void {
    if (confirm('Are you sure you want to delete this revue?')) {
      this.adminRevueService.deleteRevueById(revueId).subscribe({
        next: () => {
          this.revues = this.revues.filter(revue => revue.id !== revueId);
        },
        error: (error) => {
          console.error('Error deleting revue:', error);
          alert('An error occurred while deleting the revue.');
        }
      });
    }
  }

  onRevueClick(revue: any): void {
    this.router.navigate(['/revues/revue-description/', revue.id]);
  }
}
