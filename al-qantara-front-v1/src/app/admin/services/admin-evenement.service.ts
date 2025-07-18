import {Injectable} from '@angular/core';
import {API_URL} from '../../utils/config';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Evenement} from '../../member/models/evenement';
import {catchError, Observable, tap, throwError} from 'rxjs';
import { CloudinaryService } from '../../member/services/cloudinary.service';


@Injectable({
  providedIn: 'root'
})
export class AdminEvenementService {
  private readonly apiUrl = `${API_URL}/evenements`;
  errorMessage= '';
  constructor(
    private http: HttpClient,
    private router: Router,
    private cloudinaryService: CloudinaryService
  ) {}

  addEvenement(evenement: Evenement): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, evenement, { withCredentials: true }).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error adding event:', error);
        return throwError(() => new Error('Error adding event'));
      })
    );
  }

  editEvenement(id: number, eventData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, eventData, { withCredentials: true }).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error updating event:', error);
        return throwError(() => error);
      })
    );
  }

  updateEvenement(id: number, evenement: Evenement): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, evenement, { withCredentials: true }).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error updating event:', error);
        return throwError(() => new Error('Error updating event'));
      })
    );
  }

  deleteEvenement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true }).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        this.errorMessage = error.error.message || 'An error occurred while deleting the event.';
        console.error('Error deleting event:', error);
        return throwError(() => error);
      })
    );
  }

  getRemboursementsByEvent(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${eventId}/remboursements`, { withCredentials: true }).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la récupération des demandes de remboursement.';
        console.error('Erreur getRemboursementsByEvent:', error);
        return throwError(() => error);
      })
    );
  }

  updateRemboursementStatus(demandeId: number, status: 'accepte' | 'refuse'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/remboursements/${demandeId}`, { status }, { withCredentials: true }).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du statut de remboursement.';
        console.error('Erreur updateRemboursementStatus:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer toutes les demandes de remboursement (Admin)
   */
  getAllRemboursements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/remboursements`, { withCredentials: true }).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la récupération des demandes de remboursement.';
        console.error('Erreur getAllRemboursements:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Accepter une demande de remboursement (Admin)
   */
  accepterRemboursement(demandeId: number): Observable<any> {
    return this.updateRemboursementStatus(demandeId, 'accepte');
  }

  /**
   * Refuser une demande de remboursement (Admin)
   */
  refuserRemboursement(demandeId: number): Observable<any> {
    return this.updateRemboursementStatus(demandeId, 'refuse');
  }

  checkQRCodeParticipation(evenementId: number, userId:number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${evenementId}/qr-participation/${userId}`, {withCredentials: true}).pipe(
      tap((response) => {
      }),
      catchError((error) => {
        this.errorMessage = error.error.message || 'An error occurred while checking QR code participation.';
        console.error('Error checking QR code participation:', error);
        return throwError(() => new Error('Error checking QR code participation'));
      })
    );

  }

  // Upload d'images via Cloudinary
  async uploadImages(files: File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];
    return await this.cloudinaryService.uploadFiles(files);
  }

  // Upload d'une vidéo via Cloudinary
  async uploadVideo(file: File): Promise<string | undefined> {
    if (!file) return undefined;
    return await this.cloudinaryService.uploadFile(file);
  }

}
