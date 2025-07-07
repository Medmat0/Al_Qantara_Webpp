import { Component, OnInit, OnDestroy, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { HttpClient } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { forkJoin } from 'rxjs';

interface Article {
  id: number;
  titre: string;
  contenu: string;
  auteur: string;
  datePublication: string;
  revueId: number;
  categories: any[];
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, NgSelectModule],
  templateUrl: './edit-article.component.html',
  styleUrl: './edit-article.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EditArticleComponent implements OnInit, OnDestroy, OnChanges {
  @Input() articleId: number | null = null;
  @Input() showModal = false;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() articleUpdated = new EventEmitter<void>();

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

  loading = false;
  successMessage = '';
  errorMessage = '';

  form = new FormGroup({
    title: new FormControl('', Validators.required),
    author: new FormControl('', Validators.required),
    revue: new FormControl('', Validators.required),
    categorie: new FormControl('', Validators.required),
    content: new FormControl('', Validators.required)
  });

  constructor(private http: HttpClient, private fb: FormBuilder) {
    console.log('Constructeur EditArticleComponent, articleId initial:', this.articleId);
  }

  ngOnInit(): void {
    console.log('ngOnInit EditArticleComponent, articleId:', this.articleId, 'showModal:', this.showModal);
    this.editor = new Editor();
    this.getRevuesTitres();

    if (this.articleId) {
      console.log('articleId présent dans ngOnInit, appel de loadArticleData');
      this.loadArticleData();
    } else {
      console.log('articleId absent dans ngOnInit, pas d\'appel à loadArticleData');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges détecté:', changes);

    // Vérifier si le modal vient d'être ouvert
    if (changes['showModal'] && changes['showModal'].currentValue === true) {
      console.log('Modal ouvert, articleId actuel:', this.articleId);
      if (this.articleId) {
        console.log('Chargement des données de l\'article depuis ngOnChanges (modal ouvert)');
        this.loadArticleData();
      }
    }
    // Vérifier aussi si l'ID a changé
    else if (changes['articleId'] && changes['articleId'].currentValue) {
      console.log('articleId a changé:', changes['articleId'].currentValue);
      this.loadArticleData();
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  loadArticleData(): void {
    console.log('Début loadArticleData, articleId:', this.articleId);
    this.loading = true;

    // Récupérer les détails de l'article seulement
    this.http.get<any>(`http://localhost:3000/articles/${this.articleId}`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          console.log('Réponse de l\'API articles:', response);
          const article = response.article;
          console.log('Article chargé :', article);

          // Préremplir le formulaire avec les données de l'article
          console.log('Patchage du formulaire avec:', {
            title: article.titre,
            author: article.auteur,
            revue: article.revueId.toString(),
            content: article.contenu
          });

          this.form.patchValue({
            title: article.titre,
            author: article.auteur,
            revue: article.revueId.toString(),
            content: article.contenu
          });

          console.log('État du formulaire après patch:', this.form.value);


          setTimeout(() => {
            this.editor.setContent(article.contenu);
          }, 100);

          // Préremplir les catégories si elles existent
          if (article.categories && article.categories.length > 0) {
            console.log('Catégories trouvées:', article.categories);
            const categoryNames = article.categories.map((cat: any) => cat.nom);
            console.log('Noms des catégories:', categoryNames);
            this.form.patchValue({
              categorie: categoryNames
            });
            console.log('Catégories ajoutées au formulaire');
          } else {
            console.log('Aucune catégorie trouvée dans l\'article');
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'article:', error);
          this.errorMessage = 'Une erreur est survenue lors du chargement de l\'article.';
          this.loading = false;
        }
      });

    // Récupérer séparément toutes les catégories disponibles
    console.log('Appel à getCategoriesNoms');
    this.getCategoriesNoms();
  }

  getRevuesTitres(): void {
    // Récupérer la liste des revues pour le sélecteur
    console.log('Début getRevuesTitres');
    this.http.get<any>('http://localhost:3000/revues', { withCredentials: true })
      .subscribe({
        next: (response) => {
          console.log('Réponse API revues:', response);

          // La réponse est directement un tableau de revues
          if (Array.isArray(response)) {
            this.revues = response;
          }
          // La réponse est un objet contenant une propriété "revues"
          else if (response && response.revues) {
            this.revues = response.revues;
          }
          // Format inconnu
          else {
            console.error('Format de réponse inattendu pour les revues:', response);
            this.revues = [];
          }

          console.log('Revues récupérées:', this.revues);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des revues:', error);
        }
      });
  }

  getCategoriesNoms(): void {

    this.http.get<any>('http://localhost:3000/articles/categories/all', { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.categories = response.categories;
          this.categoriesNoms = this.categories.map(cat => cat.nom);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des catégories:', error);
        }
      });
  }

  onSubmit(): void {
    if (this.form.valid && this.articleId) {
      this.loading = true;

      // Récupérer les IDs des catégories sélectionnées
      const selectedNoms = Array.isArray(this.form.value.categorie) ? this.form.value.categorie : [this.form.value.categorie];
      const selectedIds = this.categories
        .filter(cat => selectedNoms.includes(cat.nom))
        .map(cat => cat.id);

      const updatedArticle = {
        titre: this.form.value.title,
        contenu: this.form.value.content,
        auteur: this.form.value.author,
        revueId: Number(this.form.value.revue),
        categories: selectedIds
      };

      this.http.put(`http://localhost:3000/articles/${this.articleId}`, updatedArticle, { withCredentials: true })
        .subscribe({
          next: (_) => {
            this.successMessage = 'Article modifié avec succès.';
            this.loading = false;

            // Notifier le composant parent que l'article a été mis à jour
            this.articleUpdated.emit();

            // Fermer le modal après 2 secondes
            setTimeout(() => {
              this.closeModal();
            }, 2000);
          },
          error: (error) => {
            console.error('Erreur lors de la modification de l\'article:', error);
            this.errorMessage = 'Une erreur est survenue lors de la modification de l\'article.';
            this.loading = false;
          }
        });
    }
  }

  closeModal(): void {
    this.form.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.closeModalEvent.emit();
  }
}
