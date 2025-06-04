import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

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
    ['link'],
    ['align_left', 'align_center', 'align_right'],
  ];

  constructor(private fb: FormBuilder) {
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
        ...this.form.value,
        tags: this.tags
      };
      console.log('Données du formulaire:', formData);
      // TODO: Implémentation de l'appel API pour sauvegarder le recrutement
    }
  }
}
