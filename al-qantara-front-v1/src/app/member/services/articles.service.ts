import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../utils/config';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  private apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  getAllArticles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles`);
  }

  getAllCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles/categories/all`);
  }


  getArticleById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles/${id}`);
  }
}
