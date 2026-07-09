import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DecorationMethod, ProductDecorationMethod } from '../models/customization.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiService } from './api.service';
import { MOCK_DECORATION_METHODS } from '../../mock-data/mock-decoration-methods';
import { MOCK_PRODUCT_DECORATION_METHODS } from '../../mock-data/mock-product-decoration-methods';

@Injectable({ providedIn: 'root' })
export class DecorationMethodService {
  constructor(private apiService: ApiService) {}

  // TODO: GET /api/decoration-methods
  getDecorationMethods(): Observable<ApiResponse<DecorationMethod[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'OK', data: MOCK_DECORATION_METHODS.filter((m) => m.isActive) });
    }
    return this.apiService.get<ApiResponse<DecorationMethod[]>>(API_ENDPOINTS.DECORATION_METHODS.GET_ALL);
  }

  // TODO: GET /api/decoration-methods/product/:productId
  getDecorationMethodsByProductId(productId: string): Observable<ApiResponse<DecorationMethod[]>> {
    return this.getProductDecorationMethods(productId).pipe(
      map((res) => {
        const methodIds = res.data.map((pdm) => pdm.decorationMethodId);
        const methods = MOCK_DECORATION_METHODS.filter((m) => methodIds.includes(m.id) && m.isActive);
        return { success: true, message: 'OK', data: methods };
      }),
    );
  }

  getProductDecorationMethods(productId: string): Observable<ApiResponse<ProductDecorationMethod[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const pdms = MOCK_PRODUCT_DECORATION_METHODS.filter((pdm) => pdm.productId === productId && pdm.isActive);
      return of({ success: true, message: 'OK', data: pdms });
    }
    return this.apiService.get<ApiResponse<ProductDecorationMethod[]>>(API_ENDPOINTS.DECORATION_METHODS.GET_BY_PRODUCT(productId));
  }

  getDecorationMethodExtraFee(productId: string, decorationMethodId: string): number {
    const pdm = MOCK_PRODUCT_DECORATION_METHODS.find(
      (p) => p.productId === productId && p.decorationMethodId === decorationMethodId,
    );
    if (pdm) return pdm.extraFee;

    const method = MOCK_DECORATION_METHODS.find((m) => m.id === decorationMethodId);
    return method?.baseFee ?? 0;
  }
}
