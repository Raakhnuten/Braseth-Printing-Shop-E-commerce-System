import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Coupon } from '../models/coupon.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_COUPONS } from '../../mock-data/mock-coupons';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CouponService {
  constructor(private apiService: ApiService) {}

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data };
  }

  getCoupons(): Observable<ApiResponse<Coupon[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of(this.ok(MOCK_COUPONS));
    }
    return this.apiService.get<ApiResponse<Coupon[]>>(API_ENDPOINTS.COUPONS.GET_ALL);
  }

  getCouponById(id: string): Observable<ApiResponse<Coupon | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const coupon = MOCK_COUPONS.find((c) => c.id === id) ?? null;
      return of(this.ok(coupon));
    }
    return this.apiService.get<ApiResponse<Coupon>>(API_ENDPOINTS.COUPONS.GET_BY_ID(id));
  }

  validateCouponCode(code: string): Observable<ApiResponse<Coupon | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const coupon = MOCK_COUPONS.find((c) => c.code === code) ?? null;
      return of(this.ok(coupon));
    }
    return this.apiService.get<ApiResponse<Coupon>>(API_ENDPOINTS.COUPONS.VALIDATE(code));
  }

  applyCoupon(code: string): Observable<ApiResponse<any>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const coupon = MOCK_COUPONS.find((c) => c.code === code) ?? null;
      return of(this.ok(coupon ? { discount: coupon.discountValue, type: coupon.discountType } : null));
    }
    return this.apiService.post<ApiResponse<any>>(API_ENDPOINTS.COUPONS.APPLY, { code });
  }

  createCoupon(coupon: Coupon): Observable<ApiResponse<Coupon | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      console.warn('[CouponService] createCoupon not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.post<ApiResponse<Coupon>>(API_ENDPOINTS.COUPONS.CREATE, coupon);
  }

  updateCoupon(id: string, coupon: Partial<Coupon>): Observable<ApiResponse<Coupon | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      console.warn('[CouponService] updateCoupon not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.put<ApiResponse<Coupon>>(API_ENDPOINTS.COUPONS.UPDATE(id), coupon);
  }

  // Synchronous lookup for checkout service (mock-only)
  getCouponSync(code: string): Coupon | null {
    return MOCK_COUPONS.find((c) => c.code === code) ?? null;
  }

  deleteCoupon(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      console.warn('[CouponService] deleteCoupon not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.COUPONS.DELETE(id));
  }
}
