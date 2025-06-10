import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { RecruitmentService } from '../../services/recruitment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-recruitment',
  templateUrl: './add-recruitment.component.html',
  styleUrls: ['./add-recruitment.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule]
})
export class AddRecruitmentComponent implements OnInit, OnDestroy {
  form: FormGroup;
  editor: Editor;
  tagInput = new FormControl('');
  tags: string[] = [];

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];

  constructor(
    private fb: FormBuilder,
    private recruitmentService: RecruitmentService,
    private router: Router
  ) {
    this.editor = new Editor();
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      contractType: ['', Validators.required],
      startDate: ['']
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  addTag(): void {
    const tag = this.tagInput.value?.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.tagInput.setValue('');
    }
  }

  removeTag(tagToRemove: string): void {
    this.tags = this.tags.filter(tag => tag !== tagToRemove);
  }

  onSubmit(): void {
    if (this.form.valid && this.tags.length > 0) {
      const formData = {
        titre: this.form.value.title,
        description: this.form.value.description,
        lieuDeTravail: this.form.value.location,
        typeDeContrat: this.form.value.contractType,
        dateDebut: this.form.value.startDate ? new Date(this.form.value.startDate).toISOString() : null,
        tags: this.tags
      };

      console.log('Données envoyées:', formData);

      this.recruitmentService.createOffer(formData).subscribe({
        next: (response) => {
          console.log('Offre créée avec succès:', response);
          // Ici il faut mettre la page de redirection après la création de la page recrutement
          this.router.navigate(['/admin']);
        },
        error: (error) => {
          console.error('Erreur lors de la création de l\'offre:', error);
        }
      });
    }
  }
}
