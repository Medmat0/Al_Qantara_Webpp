import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../../member/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatureService } from '../../../../../../member/services/candidature.service';

@Component({
  selector: 'app-candidature-form',
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule],
  templateUrl: './candidature-form.component.html',
  styleUrl: './candidature-form.component.scss',
  standalone: true
})
export class CandidatureFormComponent {
  
  fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  candidatureService = inject(CandidatureService);

  isAuthenticated = false;
  loadingCV = false;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
    });
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      confirm('Vous devez être connecté pour envoyer une candidature');
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }

  candidatureForm: FormGroup = this.fb.group({
    experiences: this.fb.array([
      this.fb.control('', Validators.required)
    ], Validators.required),
    competences: this.fb.array([
      this.fb.control('', Validators.required)
    ], Validators.required),
    motivation: ['']
  });

  get experiences() {
    return this.candidatureForm.get('experiences') as FormArray;
  }

  get competences() {
    return this.candidatureForm.get('competences') as FormArray;
  }



  addExperience() {
    this.experiences.push(this.fb.control('', Validators.required));
  }

  removeExperience(index: number) {
    if (this.experiences.length > 1) {
      this.experiences.removeAt(index);
    }
  }

  addCompetence() {
    this.competences.push(this.fb.control('', Validators.required));
  }

  removeCompetence(index: number) {
    if (this.competences.length > 1) {
      this.competences.removeAt(index);
    }
  }

  onSubmit() {
    if (this.candidatureForm.invalid) {
      this.candidatureForm.markAllAsTouched();
      return;
    }
    if (!this.selectedCVFile) {
      alert('Veuillez charger un fichier CV avant d’envoyer votre candidature.');
      return;
    }
    if (this.checkAuthentication()){
      const candidature = this.candidatureForm.value;
      console.log('Candidature envoyée:', candidature);
      // TODO: envoyer la candidature avec le fichier si besoin
    } else {
      return;
    }
  }

  selectedCVFile: File | null = null;

  autoFillForm(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    this.selectedCVFile = file;
    this.loadingCV = true;
    this.candidatureService.getJsonFromCVWebService(file).subscribe({
      next: (json: any) => {
        // Auto-fill experiences
        if (json.Experiences && Array.isArray(json.Experiences)) {
          this.experiences.clear();
          json.Experiences.forEach((exp: any) => {
            // You can customize the string format as needed
            const expString = `${exp.company ? exp.company + ' - ' : ''}${exp.position ? exp.position + ' - ' : ''}${exp.description || ''}`;
            this.experiences.push(this.fb.control(expString, Validators.required));
          });
          if (this.experiences.length === 0) {
            this.experiences.push(this.fb.control('', Validators.required));
          }
        }
        // Auto-fill competences (skills)
        if (json.Skills && Array.isArray(json.Skills)) {
          this.competences.clear();
          json.Skills.forEach((skill: string) => {
            this.competences.push(this.fb.control(skill, Validators.required));
          });
          if (this.competences.length === 0) {
            this.competences.push(this.fb.control('', Validators.required));
          }
        }
        // Optionally, you can also autofill motivation or other fields if present in JSON
        this.loadingCV = false;
      },
      error: () => {
        this.loadingCV = false;
      }
    });
  }
}
