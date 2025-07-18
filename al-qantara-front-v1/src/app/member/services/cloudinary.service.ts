import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../utils/config';

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private apiUrl = `${API_URL}/evenements`;

  constructor(private http: HttpClient) {}

  private async getSignature(): Promise<CloudinarySignature> {
    try {
      const response = await firstValueFrom(
        this.http.get<CloudinarySignature>(`${this.apiUrl}/cloudinary-signature`, {
          withCredentials: true
        })
      );
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la signature Cloudinary:', error);
      if (error instanceof HttpErrorResponse) {
        throw new Error(`Erreur ${error.status}: ${error.error?.message || 'Impossible de générer la signature Cloudinary'}`);
      }
      throw new Error('Impossible de générer la signature Cloudinary. Vérifiez la configuration du serveur.');
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const signature = await this.getSignature();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', signature.timestamp.toString());
      formData.append('signature', signature.signature);
      formData.append('api_key', signature.apiKey);
      formData.append('folder', 'evenements');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Upload failed: ${errorData?.error?.message || response.statusText}`);
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async uploadFiles(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }
}
