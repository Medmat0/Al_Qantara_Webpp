import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { adminRevueService } from '../../../../admin/services/admin-revue.service';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-add-revue',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './add-revue.component.html',
  styleUrls: ['./add-revue.component.scss']
})
export class AddRevueComponent {
  addRevueForm: FormGroup;
  statusMessage: string = '';
  isError: boolean = false;

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
        next: (response='Revue ajoutée avec succès.') => {
          this.isError = false;
          this.statusMessage = 'Revue ajoutée avec succès !';
          this.addRevueForm.reset();
        },
        error: (error) => {
          this.isError = true;
          this.statusMessage = error.error.message || 'Erreur lors de l\'ajout de la revue.';
        }
      });
    } else {
      this.addRevueForm.markAllAsTouched();
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.addRevueForm.patchValue({ document: input.files[0] });
      this.addRevueForm.get('document')?.markAsTouched();
    }
  }
}
