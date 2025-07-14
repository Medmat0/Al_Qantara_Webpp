import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../utils/config';

export interface Association {
  id: number;
  nom: string;
  description?: string;
  logo?: string;
  secteurActivite?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  region?: string;
  telephone?: string;
  email?: string;
  siteWeb?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  numeroRNA?: string;
  numeroSIRET?: string;
  dateCreation?: Date;
}

export interface AssociationFilters {
  ville?: string;
  region?: string;
  secteurActivite?: string;
  recherche?: string;
  page?: number;
  limite?: number;
}

export interface AnnuaireResponse {
  associations: Association[];
  pagination: {
    page: number;
    limite: number;
    total: number;
    pages: number;
  };
}

export interface StatistiquesAnnuaire {
  total: number;
  repartitionParRegion: { region: string; _count: number }[];
  repartitionParSecteur: { secteurActivite: string; _count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AnnuaireService {
  private readonly apiUrl = `${API_URL}/annuaire`;

  constructor(private http: HttpClient) {}

  // --- MÉTHODES PUBLIQUES (ANNUAIRE) ---

  /**
   * Récupérer la liste des associations avec filtres
   */
  getAssociations(filters: AssociationFilters = {}): Observable<AnnuaireResponse> {
    const params = this.buildQueryParams(filters);
    return this.http.get<AnnuaireResponse>(`${this.apiUrl}/associations`, { 
      params,
      withCredentials: true 
    });
  }

  /**
   * Récupérer une association par son ID
   */
  getAssociation(id: number): Observable<Association> {
    return this.http.get<Association>(`${this.apiUrl}/associations/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Récupérer les secteurs d'activité disponibles
   */
  getSecteursActivite(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/secteurs`, {
      withCredentials: true
    });
  }

  /**
   * Récupérer les régions disponibles
   */
  getRegions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/regions`, {
      withCredentials: true
    });
  }

  /**
   * Récupérer les statistiques de l'annuaire
   */
  getStatistiques(): Observable<StatistiquesAnnuaire> {
    return this.http.get<StatistiquesAnnuaire>(`${this.apiUrl}/statistiques`, {
      withCredentials: true
    });
  }

  // --- MÉTHODES ADMIN ---

  /**
   * Récupérer toutes les associations (admin)
   */
  getAllAssociationsAdmin(filters: { page?: number; limite?: number } = {}): Observable<AnnuaireResponse> {
    const params = this.buildQueryParams(filters);
    return this.http.get<AnnuaireResponse>(`${this.apiUrl}/admin/associations`, {
      params,
      withCredentials: true
    });
  }

  /**
   * Créer une nouvelle association (admin)
   */
  creerAssociation(association: Partial<Association>, logo?: File): Observable<{ message: string; association: Association }> {
    const formData = new FormData();
    
    // Ajouter tous les champs de l'association (sauf logo qui est géré séparément)
    Object.keys(association).forEach(key => {
      if (key !== 'logo') { // Exclure le champ logo car c'est le fichier qui compte
        const value = association[key as keyof Association];
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, value.toString());
          }
        }
      }
    });

    // Ajouter le logo s'il existe
    if (logo) {
      formData.append('logo', logo);
    }

    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    return this.http.post<{ message: string; association: Association }>(
      `${this.apiUrl}/admin/associations`,
      formData,
      { withCredentials: true }
    );
  }

  /**
   * Modifier une association (admin)
   */
  modifierAssociation(id: number, association: Partial<Association>): Observable<{ message: string; association: Association }> {
    return this.http.put<{ message: string; association: Association }>(
      `${this.apiUrl}/admin/associations/${id}`,
      association,
      { withCredentials: true }
    );
  }

  /**
   * Supprimer une association (admin)
   */
  supprimerAssociation(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/admin/associations/${id}`,
      { withCredentials: true }
    );
  }

  // --- MÉTHODES PRIVÉES ---

  private buildQueryParams(filters: any): any {
    const params: any = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params[key] = filters[key].toString();
      }
    });

    return params;
  }
}
