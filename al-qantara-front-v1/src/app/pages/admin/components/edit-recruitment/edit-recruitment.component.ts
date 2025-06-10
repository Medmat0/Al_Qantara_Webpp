import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { RecruitmentService } from '../../services/recruitment.service';

interface Offer {
  id: number;
  titre: string;
  description: string;
  lieuDeTravail: string;
  typeDeContrat: string;
  dateDebut: string;
  tags: string[];
}

@Component({
  selector: 'app-edit-recruitment',
  templateUrl: './edit-recruitment.component.html',
  styleUrls: ['./edit-recruitment.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule]
})
export class EditRecruitmentComponent implements OnInit {
  @Input() offerId!: number;
  @Output() closeModal = new EventEmitter<void>();
  @Output() offerUpdated = new EventEmitter<void>();

  form!: FormGroup;
  editor: Editor;
  tagInput = new FormControl('');
  tags: string[] = [];
  isLoading = false;

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];

  constructor(
    private fb: FormBuilder,
    private recruitmentService: RecruitmentService
  ) {
    this.editor = new Editor();
    this.initForm();
  }

  ngOnInit(): void {
    if (this.offerId) {
      this.loadOfferData();
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      contractType: ['', Validators.required],
      startDate: ['']
    });
  }

  private loadOfferData(): void {
    this.isLoading = true;
    this.recruitmentService.getOfferById(this.offerId).subscribe({
      next: (response: any) => {
        const offer = response.offre;
        console.log('Données reçues:', offer);

        this.form.patchValue({
          title: offer.titre,
          description: offer.description,
          location: offer.lieuDeTravail,
          contractType: offer.typeDeContrat,
          startDate: offer.dateDebut ? offer.dateDebut.split('T')[0] : ''
        });
        this.tags = offer.tags || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'offre:', error);
        this.isLoading = false;
      }
    });
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
    if (this.form.valid) {
      const formData = {
        titre: this.form.value.title,
        description: this.form.value.description,
        lieuDeTravail: this.form.value.location,
        typeDeContrat: this.form.value.contractType,
        dateDebut: this.form.value.startDate ? new Date(this.form.value.startDate).toISOString() : null,
        tags: this.tags
      };

      this.recruitmentService.updateOffer(this.offerId, formData).subscribe({
        next: () => {
          this.offerUpdated.emit();
          this.closeModal.emit();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de l\'offre:', error);
        }
      });
    }
  }
}
