import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RevueService } from '../../../../member/services/revues.service';

@Component({
  selector: 'app-revue-description',
  imports: [],
  templateUrl: './revue-description.component.html',
  standalone: true,
  styleUrls: ['./revue-description.component.css']
})
export class RevueDescriptionComponent implements OnInit {
  revueId: number | null = null;
  revueService = inject(RevueService);
  // Placeholder for revue img, replace later on
  revueImg = null;
  revueTitle: string = "Title";
  revueDescription: string = "Description";

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.route.paramMap.subscribe((paramMap) => {
      this.revueId = Number(paramMap.get('id'));
      if (this.revueId) {
        this.fetchRevueDetails(this.revueId);
      }
    });
  }

  private fetchRevueDetails(id: number): void {
    this.revueService.getRevueById(id).subscribe({
      next: (response: { img: null; title: string; description: string }) => {
        // Handle successful response
        console.log('Revue fetched successfully:', response);
        // Update when API is updated
        // this.revueImg = response.img;
        this.revueTitle = response.title;
        this.revueDescription = response.description;
      },
      error: (error: any) => {
        // Handle error
        console.error('Error fetching revue:', error);
      }
    });
  }
}
