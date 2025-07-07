import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { HttpClient } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { API_URL } from '../../../../utils/config';


@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, NgSelectModule],
  templateUrl: './add-article.component.html',
  styleUrl: './add-article.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AddArticleComponent implements OnInit, OnDestroy {
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify']
  ];

  revues: { id: number, titre: string }[] = [];
  categoriesNoms: string[] = [];
  categories: { id: number, nom: string }[] = [];
  successMessage = '';

  form = new FormGroup({
    title: new FormControl('', Validators.required),
    author: new FormControl('', Validators.required),
    revue: new FormControl('', Validators.required),
    categorie: new FormControl('', Validators.required),
    content: new FormControl('', Validators.required)
  });

  showCategoryModal = false;
  categoryForm: FormGroup;
  categorySuccess = '';
  categoryError = '';
  loadingCategory = false;

  showDeleteCategoryModal = false;
  categoryToDelete: { id: number, nom: string } | null = null;
  deleteCategorySuccess = '';
  deleteCategoryError = '';
  loadingDelete = false;
  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.getRevuesTitres();
    this.getCategoriesNoms();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSubmit() {
    if (this.form.valid) {
      // Récupérer les IDs des catégories sélectionnées
      const selectedNoms = Array.isArray(this.form.value.categorie) ? this.form.value.categorie : [this.form.value.categorie];
      const selectedIds = this.categories
        .filter(cat => selectedNoms.includes(cat.nom))
        .map(cat => cat.id);
      const article = {
        titre: this.form.value.title,
        contenu: this.form.value.content,
        auteur: this.form.value.author,
        revueId: Number(this.form.value.revue),
        categories: selectedIds
      };
      console.log('Body envoyé à l\'API :', article);
      this.http.post('${API_URL}/articles', article, { withCredentials: true }).subscribe(
        (res) => {
          console.log('Article publié avec succès', res);
          // Afficher le message de succès
          this.successMessage = 'Article publié avec succès';
          // Réinitialiser le formulaire
          this.form.reset();
          this.editor.setContent('');
          // Masquer le message après 5 secondes
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        (err) => {
          console.error('Erreur lors de la publication de l\'article', err);
        }
      );
    }
  }

  getRevuesTitres() {
    this.http.get<any[]>('${API_URL}/revues/').subscribe(data => {
      this.revues = data.map(r => ({ id: r.id, titre: r.titre }));
      console.log('Revues:', this.revues);
    });
  }

  getCategoriesNoms() {
    this.http.get<any>('${API_URL}/articles/categories/all', { withCredentials: true }).subscribe(data => {
      this.categories = (data.categories || []).map((c: any) => ({ id: c.id, nom: c.nom }));
      this.categoriesNoms = this.categories.map(c => c.nom); // pour ng-select
      console.log('Catégories:', this.categories);
    });
  }

  openCategoryModal() {
    this.categoryForm.reset();
    this.categorySuccess = '';
    this.categoryError = '';
    this.showCategoryModal = true;
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.categoryForm.reset();
    this.categorySuccess = '';
    this.categoryError = '';
  }

  addCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.loadingCategory = true;
    this.categorySuccess = '';
    this.categoryError = '';
    const nom = this.categoryForm.value.nom;
    this.http.post('${API_URL}/articles/categories', { nom }, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.categorySuccess = 'Catégorie ajoutée avec succès !';
        this.loadingCategory = false;
        this.getCategoriesNoms();
        setTimeout(() => {
          this.closeCategoryModal();
        }, 500);
      },
      error: (err) => {
        this.categoryError = err.error?.message || 'Erreur lors de l\'ajout de la catégorie.';
        this.loadingCategory = false;
      }
    });
  }

  selectCategory(nom: string) {
    this.form.patchValue({ categorie: nom });
  }

  openDeleteCategoryModal(cat: { id: number, nom: string }) {
    this.categoryToDelete = cat;
    this.showDeleteCategoryModal = true;
    this.deleteCategorySuccess = '';
    this.deleteCategoryError = '';
  }

  closeDeleteCategoryModal() {
    this.showDeleteCategoryModal = false;
    this.categoryToDelete = null;
    this.deleteCategorySuccess = '';
    this.deleteCategoryError = '';
  }

  confirmDeleteCategory() {
    if (!this.categoryToDelete) return;
    this.loadingDelete = true;
    this.deleteCategorySuccess = '';
    this.deleteCategoryError = '';
    this.http.delete(`${API_URL}/articles/categories/${this.categoryToDelete.id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.deleteCategorySuccess = 'Catégorie supprimée avec succès !';
          this.getCategoriesNoms();
          this.loadingDelete = false;
          setTimeout(() => {
            this.closeDeleteCategoryModal();
          }, 500);
        },
        error: (err) => {
          this.deleteCategoryError = err.error?.message || 'Erreur lors de la suppression.';
          this.loadingDelete = false;
        }
      });
  }
}
