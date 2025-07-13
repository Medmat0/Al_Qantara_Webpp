import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../utils/config';

export interface Guide {
  id: number;
  nom: string;
  region: string;
  description: string;
  image?: string;
  images: string[];
  latitude: number;
  longitude: number;
  actif: boolean;
  dateCreation: string;
  creePar: number;
  createur: {
    id: number;
    nom: string;
    prenom: string;
  };
  pointsInteret: PointInteret[];
  _count?: {
    pointsInteret: number;
  };
}

export interface PointInteret {
  id: number;
  nom: string;
  description?: string;
  adresse: string;
  latitude: number;
  longitude: number;
  images: string[];
  horairesOuverture?: string;
  tarifs?: string;
  telephone?: string;
  siteWeb?: string;
  email?: string;
  typePoint: TypePointInteret;
  ordre: number;
  actif: boolean;
  guideId: number;
}

export enum TypePointInteret {
  MONUMENT = 'MONUMENT',
  MUSEE = 'MUSEE',
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  PLAGE = 'PLAGE',
  PARC = 'PARC',
  MARCHE = 'MARCHE',
  ARTISANAT = 'ARTISANAT',
  AUTRE = 'AUTRE'
}

export interface GuideCreateRequest {
  nom: string;
  region: string;
  description: string;
  latitude: number;
  longitude: number;
  pointsInteret?: Partial<PointInteret>[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuidesService {
  private apiUrl = `${API_URL}/api/guides`; // Utilisation de la constante API_URL

  constructor(private http: HttpClient) {}

  // Obtenir tous les guides avec pagination
  getAllGuides(params?: {
    page?: number;
    limit?: number;
    actif?: boolean | 'all';
  }): Observable<ApiResponse<Guide[]>> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.actif !== undefined) httpParams = httpParams.set('actif', params.actif.toString());

    return this.http.get<ApiResponse<Guide[]>>(this.apiUrl, { 
      params: httpParams,
      withCredentials: true 
    });
  }

  // Obtenir un guide par ID
  getGuideById(id: number): Observable<ApiResponse<Guide>> {
    return this.http.get<ApiResponse<Guide>>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  // Créer un nouveau guide
  createGuide(formData: FormData): Observable<ApiResponse<Guide>> {
    return this.http.post<ApiResponse<Guide>>(this.apiUrl, formData, {
      withCredentials: true
    });
  }

  // Mettre à jour un guide
  updateGuide(id: number, formData: FormData): Observable<ApiResponse<Guide>> {
    return this.http.put<ApiResponse<Guide>>(`${this.apiUrl}/${id}`, formData, {
      withCredentials: true
    });
  }

  // Supprimer un guide
  deleteGuide(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  // Points d'intérêt
  getPointsInteret(guideId: number): Observable<ApiResponse<PointInteret[]>> {
    return this.http.get<ApiResponse<PointInteret[]>>(`${this.apiUrl}/${guideId}/points-interet`, {
      withCredentials: true
    });
  }

  createPointInteret(guideId: number, formData: FormData): Observable<ApiResponse<PointInteret>> {
    return this.http.post<ApiResponse<PointInteret>>(`${this.apiUrl}/${guideId}/points-interet`, formData, {
      withCredentials: true
    });
  }

  updatePointInteret(guideId: number, pointId: number, formData: FormData): Observable<ApiResponse<PointInteret>> {
    return this.http.put<ApiResponse<PointInteret>>(`${this.apiUrl}/${guideId}/points-interet/${pointId}`, formData, {
      withCredentials: true
    });
  }

  deletePointInteret(guideId: number, pointId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${guideId}/points-interet/${pointId}`, {
      withCredentials: true
    });
  }

  reorderPointsInteret(guideId: number, pointsOrder: {id: number, ordre: number}[]): Observable<ApiResponse<PointInteret[]>> {
    return this.http.put<ApiResponse<PointInteret[]>>(`${this.apiUrl}/${guideId}/points-interet/reorder`, { pointsOrder }, {
      withCredentials: true
    });
  }

  // Utilitaires pour créer FormData
  createGuideFormData(guide: GuideCreateRequest, mainImage?: File, galleryImages?: File[]): FormData {
    const formData = new FormData();
    
    formData.append('nom', guide.nom);
    formData.append('region', guide.region);
    formData.append('description', guide.description);
    formData.append('latitude', guide.latitude.toString());
    formData.append('longitude', guide.longitude.toString());
    
    if (guide.pointsInteret) {
      formData.append('pointsInteret', JSON.stringify(guide.pointsInteret));
    }
    
    if (mainImage) {
      formData.append('image', mainImage);
    }
    
    if (galleryImages) {
      galleryImages.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return formData;
  }

  createPointInteretFormData(point: Partial<PointInteret>, images?: File[]): FormData {
    const formData = new FormData();
    
    if (point.nom) formData.append('nom', point.nom);
    if (point.description) formData.append('description', point.description);
    if (point.adresse) formData.append('adresse', point.adresse);
    if (point.latitude) formData.append('latitude', point.latitude.toString());
    if (point.longitude) formData.append('longitude', point.longitude.toString());
    if (point.horairesOuverture) formData.append('horairesOuverture', point.horairesOuverture);
    if (point.tarifs) formData.append('tarifs', point.tarifs);
    if (point.telephone) formData.append('telephone', point.telephone);
    if (point.siteWeb) formData.append('siteWeb', point.siteWeb);
    if (point.email) formData.append('email', point.email);
    if (point.typePoint) formData.append('typePoint', point.typePoint);
    if (point.ordre) formData.append('ordre', point.ordre.toString());
    
    if (images) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    return formData;
  }
}
