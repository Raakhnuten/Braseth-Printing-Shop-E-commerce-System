import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Category } from '../models/category.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_CATEGORIES } from '../../mock-data/mock-categories';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private apiService: ApiService) {}

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data };
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return of(this.ok(MOCK_CATEGORIES));
    }
    return this.apiService.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.GET_ALL);
  }

  getCategoryById(id: string): Observable<ApiResponse<Category | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const cat = MOCK_CATEGORIES.find((c) => c.id === id) ?? null;
      return of(this.ok(cat));
    }
    return this.apiService.get<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
  }

  createCategory(category: Category): Observable<ApiResponse<Category | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const newCat: Category = {
        ...category,
        id: `cat-${Date.now()}`,
        childIds: category.childIds || [],
      };
      return of(this.ok(newCat));
    }
    return this.apiService.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.CREATE, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<ApiResponse<Category | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx === -1) return of(this.ok(null));
      const updated: Category = { ...MOCK_CATEGORIES[idx], ...category, id };
      return of(this.ok(updated));
    }
    return this.apiService.put<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.UPDATE(id), category);
  }

  deleteCategory(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.CATEGORIES.DELETE(id));
  }
}
