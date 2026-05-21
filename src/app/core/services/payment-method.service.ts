import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaymentMethod } from '../models/payment-method.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_PAYMENT_METHODS } from '../../mock-data/mock-payment-methods';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  constructor(private apiService: ApiService) {}

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data };
  }

  getPaymentMethods(): Observable<ApiResponse<PaymentMethod[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of(this.ok(MOCK_PAYMENT_METHODS));
    }
    return this.apiService.get<ApiResponse<PaymentMethod[]>>(API_ENDPOINTS.PAYMENT_METHODS.GET_ALL);
  }

  getPaymentMethodById(id: string): Observable<ApiResponse<PaymentMethod | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const pm = MOCK_PAYMENT_METHODS.find((m) => m.id === id) ?? null;
      return of(this.ok(pm));
    }
    return this.apiService.get<ApiResponse<PaymentMethod>>(API_ENDPOINTS.PAYMENT_METHODS.GET_BY_ID(id));
  }

  createPaymentMethod(paymentMethod: PaymentMethod): Observable<ApiResponse<PaymentMethod | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[PaymentMethodService] createPaymentMethod not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.post<ApiResponse<PaymentMethod>>(API_ENDPOINTS.PAYMENT_METHODS.CREATE, paymentMethod);
  }

  updatePaymentMethod(id: string, paymentMethod: Partial<PaymentMethod>): Observable<ApiResponse<PaymentMethod | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[PaymentMethodService] updatePaymentMethod not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.put<ApiResponse<PaymentMethod>>(API_ENDPOINTS.PAYMENT_METHODS.UPDATE(id), paymentMethod);
  }

  deletePaymentMethod(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[PaymentMethodService] deletePaymentMethod not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.PAYMENT_METHODS.DELETE(id));
  }
}
