import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { APP_CONFIG } from '../constants/app-config';
import { PlatziCategory } from '../models/platzi/platzi-category.model';
import { mapPlatziCategoryToCategory } from '../mappers/platzi-category.mapper';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class PlatziCategoryService {
  private readonly apiUrl = APP_CONFIG.PLATZI_API_BASE_URL;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http
      .get<PlatziCategory[]>(`${this.apiUrl}/categories`)
      .pipe(map((list) => list.map(mapPlatziCategoryToCategory)));
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http
      .get<PlatziCategory>(`${this.apiUrl}/categories/${id}`)
      .pipe(map(mapPlatziCategoryToCategory));
  }
}
