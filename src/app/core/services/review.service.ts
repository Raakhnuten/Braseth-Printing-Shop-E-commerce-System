import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Review } from '../models/review.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_REVIEWS } from '../../mock-data/mock-reviews';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private apiService: ApiService) {}

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data };
  }

  getReviews(): Observable<ApiResponse<Review[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of(this.ok(MOCK_REVIEWS));
    }
    return this.apiService.get<ApiResponse<Review[]>>(API_ENDPOINTS.REVIEWS.GET_ALL);
  }

  getReviewsByProduct(productId: string): Observable<ApiResponse<Review[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const filtered = MOCK_REVIEWS.filter((r) => r.productId === productId);
      return of(this.ok(filtered));
    }
    return this.apiService.get<ApiResponse<Review[]>>(API_ENDPOINTS.REVIEWS.GET_BY_PRODUCT(productId));
  }

  createReview(review: Review): Observable<ApiResponse<Review | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[ReviewService] createReview not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.post<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.CREATE, review);
  }

  updateReview(id: string, review: Partial<Review>): Observable<ApiResponse<Review | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[ReviewService] updateReview not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.put<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.UPDATE(id), review);
  }

  deleteReview(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[ReviewService] deleteReview not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.REVIEWS.DELETE(id));
  }
}
