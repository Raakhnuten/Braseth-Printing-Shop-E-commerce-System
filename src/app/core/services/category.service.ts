import { Injectable } from '@angular/core';
import { map, Observable, of, shareReplay } from 'rxjs';
import { Category } from '../models/category.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_CATEGORIES } from '../../mock-data/mock-categories';
import { PlatziCategoryService } from './platzi-category.service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(
    private apiService: ApiService,
    private platzi: PlatziCategoryService,
  ) {}

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data };
  }

  private categories$: Observable<ApiResponse<Category[]>> | null = null;

  getCategories(): Observable<ApiResponse<Category[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return of(this.ok(MOCK_CATEGORIES));
    }
    if (!this.categories$) {
      if (APP_CONFIG.USE_FAKE_API) {
        this.categories$ = this.platzi.getCategories().pipe(
          map((list) => this.ok(list)),
          shareReplay(1),
        );
      } else {
        this.categories$ = this.apiService.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.GET_ALL).pipe(
          shareReplay(1),
        );
      }
    }
    return this.categories$;
  }

  getCategoryById(id: string): Observable<ApiResponse<Category | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const cat = MOCK_CATEGORIES.find((c) => c.id === id) ?? null;
      return of(this.ok(cat));
    }
    if (APP_CONFIG.USE_FAKE_API) {
      return this.platzi.getCategoryById(id).pipe(map((c) => this.ok(c)));
    }
    return this.apiService.get<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
  }

  createCategory(category: Category): Observable<ApiResponse<Category | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[CategoryService] createCategory not supported in current data source mode');
      return of(this.ok(null));
    }
    return this.apiService.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.CREATE, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<ApiResponse<Category | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[CategoryService] updateCategory not supported in current data source mode');
      return of(this.ok(null));
    }
    return this.apiService.put<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.UPDATE(id), category);
  }

  deleteCategory(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[CategoryService] deleteCategory not supported in current data source mode');
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.CATEGORIES.DELETE(id));
  }
}
