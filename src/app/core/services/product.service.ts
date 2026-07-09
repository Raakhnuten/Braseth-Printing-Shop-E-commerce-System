import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { ApiResponse, ApiMeta, PaginationParams } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_PRODUCTS } from '../../mock-data/mock-products';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private apiService: ApiService) {}

  private buildMeta(total: number, page = 1, pageSize = 12): ApiMeta {
    return {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1,
    };
  }

  private ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
    return { success: true, message: 'OK', data, meta };
  }

  // >>> API CONNECTION: All methods follow this pattern:
  //     USE_MOCK_DATA=true  → returns local mock data (offline/dev mode)
  //     USE_MOCK_DATA=false → sends real HTTP request to API_BASE_URL <<<
  getProducts(filters?: Partial<PaginationParams>): Observable<ApiResponse<Product[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return of(this.ok(MOCK_PRODUCTS, this.buildMeta(MOCK_PRODUCTS.length)));
    }
    // >>> API CONNECTION: GET /api/products <<<
    return this.apiService.get<ApiResponse<Product[]>>(API_ENDPOINTS.PRODUCTS.GET_ALL, filters);
  }

  getProductById(id: string): Observable<ApiResponse<Product | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const product = MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
      return of(this.ok(product));
    }
    // >>> API CONNECTION: GET /api/products/:id <<<
    return this.apiService.get<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
  }

  getFeaturedProducts(): Observable<ApiResponse<Product[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const featured = MOCK_PRODUCTS.filter((p) => p.featured);
      return of(this.ok(featured, this.buildMeta(featured.length)));
    }
    // >>> API CONNECTION: GET /api/products/featured <<<
    return this.apiService.get<ApiResponse<Product[]>>(API_ENDPOINTS.PRODUCTS.GET_FEATURED);
  }

  getProductsByCategory(categoryId: string): Observable<ApiResponse<Product[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const filtered = MOCK_PRODUCTS.filter((p) => p.categoryId === categoryId);
      return of(this.ok(filtered, this.buildMeta(filtered.length)));
    }
    // >>> API CONNECTION: GET /api/products/category/:id <<<
    return this.apiService.get<ApiResponse<Product[]>>(API_ENDPOINTS.PRODUCTS.GET_BY_CATEGORY(categoryId));
  }

  searchProducts(keyword: string): Observable<ApiResponse<Product[]>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const kw = keyword.toLowerCase();
      const results = MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw),
      );
      return of(this.ok(results, this.buildMeta(results.length)));
    }
    // >>> API CONNECTION: GET /api/products/search?q=:keyword <<<
    return this.apiService.get<ApiResponse<Product[]>>(API_ENDPOINTS.PRODUCTS.SEARCH, { q: keyword });
  }

  createProduct(product: Product): Observable<ApiResponse<Product | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.warn('[ProductService] createProduct not supported in mock data mode');
      return of(this.ok(null));
    }
    // >>> API CONNECTION: POST /api/products <<<
    return this.apiService.post<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.CREATE, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<ApiResponse<Product | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.warn('[ProductService] updateProduct not supported in mock data mode');
      return of(this.ok(null));
    }
    return this.apiService.put<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.UPDATE(id), product);
  }

  deleteProduct(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      console.warn('[ProductService] deleteProduct not supported in mock data mode');
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }
}
