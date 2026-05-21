import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Banner } from '../models/banner.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_BANNERS } from '../../mock-data/mock-banners';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BannerService {
  constructor(private apiService: ApiService) {}

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data };
  }

  getBanners(): Observable<ApiResponse<Banner[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of(this.ok(MOCK_BANNERS));
    }
    return this.apiService.get<ApiResponse<Banner[]>>(API_ENDPOINTS.BANNERS.GET_ALL);
  }

  getBannerById(id: string): Observable<ApiResponse<Banner | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const banner = MOCK_BANNERS.find((b) => b.id === id) ?? null;
      return of(this.ok(banner));
    }
    return this.apiService.get<ApiResponse<Banner>>(API_ENDPOINTS.BANNERS.GET_BY_ID(id));
  }

  createBanner(banner: Banner): Observable<ApiResponse<Banner | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[BannerService] createBanner not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.post<ApiResponse<Banner>>(API_ENDPOINTS.BANNERS.CREATE, banner);
  }

  updateBanner(id: string, banner: Partial<Banner>): Observable<ApiResponse<Banner | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[BannerService] updateBanner not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.put<ApiResponse<Banner>>(API_ENDPOINTS.BANNERS.UPDATE(id), banner);
  }

  deleteBanner(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[BannerService] deleteBanner not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.BANNERS.DELETE(id));
  }
}
