import {Injectable} from '@angular/core';
import {API_URL} from '../../utils/config';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {catchError, firstValueFrom, Observable, tap, throwError} from 'rxjs';
import { CloudinaryService } from './cloudinary.service';

export interface CreateEvenementDto {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  type: string;
  adresse: string;
  placesTotal?: number;
  images: string[];
  video?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvenementService {  private readonly apiUrl = `${API_URL}/evenements`;
  constructor(
    private http: HttpClient,
    private router: Router,
    private cloudinaryService: CloudinaryService
  ) {}


  getAllEvenements() :Observable<any>{
    return this.http.get(`${this.apiUrl}`).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error fetching events:', error);
        return throwError(() => new Error('Error fetching events'));
      })
    );
  }

  getEvenementById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error fetching event:', error);
        return throwError(() => new Error('Error fetching event'));
      })
    );
  }

  addParticipationToEvenement(EvenementId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${EvenementId}/participer`,
      {},
      { withCredentials: true }
    ).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error adding participation:', error);
        return throwError(() => new Error('Error adding participation'));
      })
    );
  }

  checkParticipation(EvenementId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${EvenementId}/participation`,
      { withCredentials: true }
    ).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error checking participation:', error);
        return throwError(() => new Error('Error checking participation'));
      })
    );
  }


  removeParticipationFromEvenement(evenementId:number): Observable<any>{
    return this.http.delete(
      `${this.apiUrl}/${evenementId}/desinscription`,
      { withCredentials: true }
    ).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error removing participation:', error);
        return throwError(() => new Error('Error removing participation'));
      })
    );

  }

  likeEvenement(evenementId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${evenementId}/like`,
      {},
      { withCredentials: true }
    ).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error liking event:', error);
        return throwError(() => new Error('Error liking event'));
      })
    );
  }

  addCommentToEvenement(evenementId: number, comment: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${evenementId}/comment`,
      { contenu: comment },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error adding comment:', error);
        return throwError(() => new Error('Error adding comment'));
      })
    );
  }

  rateEvenement(evenementId: number, rating: {
    noteOrganisateur: number;
    noteLieu: number;
    noteAmbiance: number;
    noteEvenement: number;
    commentaire: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${evenementId}/rate`,
      rating,
      { withCredentials: true }
    ).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error rating event:', error);
        return throwError(() => new Error('Error rating event'));
      })
    );
  }

  deleteEvenementComment(evenementId: number, commentId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${evenementId}/comment/${commentId}`,
      { withCredentials: true }
    ).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error deleting comment:', error);
        return throwError(() => new Error('Error deleting comment'));
      })
    );
  }

  async createEvenement(
    evenement: CreateEvenementDto,
    imageFiles: File[],
    videoFile?: File
  ): Promise<any> {
    try {
      console.log('Création d\'événement - Données reçues:', {
        evenement,
        nombreImages: imageFiles.length,
        detailsImages: imageFiles.map(f => ({
          nom: f.name,
          taille: f.size,
          type: f.type
        })),
        videoFile: videoFile ? {
          nom: videoFile.name,
          taille: videoFile.size,
          type: videoFile.type
        } : 'Aucune vidéo'
      });

      // Upload images
      const imageUrls = await this.cloudinaryService.uploadFiles(imageFiles);

      // Upload video if provided
      let videoUrl: string | undefined;
      if (videoFile) {
        videoUrl = await this.cloudinaryService.uploadFile(videoFile);
      }

      const payload = {
        ...evenement,
        images: imageUrls,
        video: videoUrl
      };

      return firstValueFrom(
        this.http.post(`${this.apiUrl}`, payload, { withCredentials: true }).pipe(
          tap((response) => {
          }),
          catchError((error) => {
            console.error('Erreur lors de la création de l\'événement:', error);
            return throwError(() => new Error('Error creating event'));
          })
        )
      );
    } catch (error) {
      console.error('Erreur pendant l\'upload des fichiers:', error);
      throw new Error('Error uploading files');
    }
  }
}
