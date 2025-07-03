import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {CommunityService} from '../../../../member/services/community.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-community-creation',
  templateUrl: './community-creation.component.html',
  styleUrl: './community-creation.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ]
})
export class CommunityCreationComponent{
  form: FormGroup;
  logoFile: File | null = null;
  error: string | null = null;
  loading = false;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private communityService: CommunityService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      logo: [null, Validators.required]
    });
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'image/png') {
        this.error = 'Seuls les fichiers PNG sont acceptés.';
        this.form.get('logo')?.setValue(null);
        this.logoPreview = null;
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        this.error = 'Le fichier est trop volumineux (max 20 Mo).';
        this.form.get('logo')?.setValue(null);
        this.logoPreview = null;
        return;
      }
      this.logoFile = file;
      this.form.get('logo')?.setValue(file);
      this.error = null;

      // Lecture du fichier pour l’aperçu
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.logoPreview = null;
    }
  }

  submit() {
    if (this.form.invalid || !this.logoFile) {
      this.error = 'Tous les champs sont obligatoires.';
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    const { nom, description } = this.form.value;
    this.communityService.createCommunity(this.logoFile, nom, description).subscribe({
      next: () => {
        this.router.navigate(['/communities']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création.';
        this.loading = false;
      }
    });
  }
}
