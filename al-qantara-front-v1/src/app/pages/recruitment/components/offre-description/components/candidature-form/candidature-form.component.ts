import { Component, inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../../member/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatureService } from '../../../../../../member/services/candidature.service';

@Component({
  selector: 'app-candidature-form',
  imports: [NgFor, NgIf, NgClass, FormsModule, ReactiveFormsModule],
  templateUrl: './candidature-form.component.html',
  styleUrl: './candidature-form.component.scss',
  standalone: true
})
export class CandidatureFormComponent implements OnInit, OnChanges {

  fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  candidatureService = inject(CandidatureService);
  @Input() offre: any;

  isAuthenticated = false;
  loadingCV = false;
  loadingSubmit = false;
  hasAlreadyApplied = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'warning' | 'info' = 'info';

  constructor(private router: Router) {
    this.authService.authStatus$.subscribe((status) => {
      this.isAuthenticated = status;
    });
  }

  ngOnInit() {
    this.checkIfAlreadyApplied();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['offre'] && this.offre && this.offre.id) {
      this.checkIfAlreadyApplied();
    }
  }

  checkIfAlreadyApplied() {
    if (this.offre && this.offre.id) {
      this.candidatureService.checkCandidature(this.offre.id).subscribe({
        next: (response) => {
          this.hasAlreadyApplied = !!(response && response.hasApplied);
          console.log('Candidature vérifiée avec succès:', response);
        },
        error: (error) => {
          console.error('Erreur lors de la vérification de la candidature:', error);
        }
      });
    }
  }

  checkAuthentication(): boolean {
    if (!this.isAuthenticated) {
      this.showCustomNotification('Vous devez être connecté pour envoyer une candidature', 'warning');
      setTimeout(() => {
        this.router.navigate(['auth/login']);
      }, 2000);
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
      this.showCustomNotification('Veuillez charger un fichier CV avant d\'envoyer votre candidature.', 'warning');
      return;
    }
    if (this.checkAuthentication()) {
      const candidature = this.candidatureForm.value;
      this.loadingSubmit = true; // Commencer le chargement

      this.candidatureService.addCandidature(
        this.offre.id,
        this.selectedCVFile,
        candidature.experiences,
        candidature.competences,
        candidature.motivation
      ).subscribe({
        next: (response) => {
          this.showCustomNotification('Votre candidature a été envoyée avec succès ! Nous vous contacterons bientôt.', 'success');
          this.candidatureForm.reset();
          this.experiences.clear();
          this.competences.clear();
          this.selectedCVFile = null;
          this.hasAlreadyApplied = true; // Affiche le message après envoi
          this.loadingSubmit = false; // Arrêter le chargement
        },
        error: (error) => {
          this.showCustomNotification('Une erreur est survenue lors de l\'envoi de votre candidature. Veuillez réessayer plus tard.', 'error');
          this.loadingSubmit = false; // Arrêter le chargement même en cas d'erreur
        }
      });

      } else {
      return;
    }
  }

  selectedCVFile: File | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedCVFile = null;
      return;
    }
    this.selectedCVFile = input.files[0];
  }

  autoFillForm() {
    if (!this.selectedCVFile) {
      return;
    }
    this.loadingCV = true;
    this.candidatureService.getJsonFromCVWebService(this.selectedCVFile).subscribe({
      next: (json: any) => {
        // Auto-fill experiences (add only new ones, remplace le premier champ vide si présent)
        if (json.Experiences && Array.isArray(json.Experiences)) {
          let existingExperiences = this.experiences.controls.map(ctrl => ctrl.value);
          if (this.experiences.length === 1 && !existingExperiences[0]) {
            this.experiences.removeAt(0);
          }
          json.Experiences.forEach((exp: any) => {
            const expString = `${exp.company ? exp.company + ' - ' : ''}${exp.position ? exp.position + ' - ' : ''}${exp.description || ''}`;
            if (!this.experiences.controls.some(ctrl => ctrl.value === expString)) {
              this.experiences.push(this.fb.control(expString, Validators.required));
            }
          });
        }
        // Auto-fill competences (add only new ones, remplace le premier champ vide si présent)
        if (json.Skills && Array.isArray(json.Skills)) {
          let existingSkills = this.competences.controls.map(ctrl => ctrl.value);
          if (this.competences.length === 1 && !existingSkills[0]) {
            this.competences.removeAt(0);
          }
          json.Skills.forEach((skill: string) => {
            if (!this.competences.controls.some(ctrl => ctrl.value === skill)) {
              this.competences.push(this.fb.control(skill, Validators.required));
            }
          });
        }
        this.loadingCV = false;
      },
      error: () => {
        this.loadingCV = false;
      }
    });
  }

  showCustomNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
      this.closeNotification();
    }, 5000);
  }

  closeNotification() {
    this.showNotification = false;
    this.notificationMessage = '';
  }
}
