import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule],
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

  constructor(private http: HttpClient) {}

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
      this.http.post('http://localhost:3000/articles', article, { withCredentials: true }).subscribe(
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
    this.http.get<any[]>('http://localhost:3000/revues/').subscribe(data => {
      this.revues = data.map(r => ({ id: r.id, titre: r.titre }));
      console.log('Revues:', this.revues);
    });
  }

  getCategoriesNoms() {
    this.http.get<any>('http://localhost:3000/articles/categories/all', { withCredentials: true }).subscribe(data => {
      this.categories = (data.categories || []).map((c: any) => ({ id: c.id, nom: c.nom }));
      this.categoriesNoms = this.categories.map(c => c.nom); // pour ng-select
      console.log('Catégories:', this.categories);
    });
  }
}
