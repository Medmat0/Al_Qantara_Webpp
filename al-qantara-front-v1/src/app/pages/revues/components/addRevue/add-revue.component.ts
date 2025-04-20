import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { adminRevueService } from '../../../../admin/services/admin-revue.service';

@Component({
  selector: 'app-add-revue',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-revue.component.html',
  styleUrls: ['./add-revue.component.scss']
})
export class AddRevueComponent {
  addRevueForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private revueService: adminRevueService
  ) {
    this.addRevueForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      mois: ['', Validators.required],
      annee: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      document: [null, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.addRevueForm.valid) {
      const { titre, description, mois, annee, document } = this.addRevueForm.value;
      this.revueService.addRevue(titre, description, document, mois, annee).subscribe({
        next: (response) => {
          console.log('Revue added successfully:', response);
          this.addRevueForm.reset();
        },
        error: (error) => {
          console.error('Error adding revue:', error);
        }
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.addRevueForm.patchValue({ document: input.files[0] });
    }
  }
}
