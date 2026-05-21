import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductVariant } from '../models/customization.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { ApiService } from './api.service';
import { MOCK_PRODUCT_VARIANTS } from '../../mock-data/mock-product-variants';

@Injectable({ providedIn: 'root' })
export class ProductVariantService {
  constructor(private apiService: ApiService) {}

  // TODO: GET /api/product-variants/product/:productId
  getVariantsByProductId(productId: string): Observable<ApiResponse<ProductVariant[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const variants = MOCK_PRODUCT_VARIANTS.filter((v) => v.productId === productId);
      return of({ success: true, message: 'OK', data: variants });
    }
    return this.apiService.get<ApiResponse<ProductVariant[]>>(`/product-variants/product/${productId}`);
  }

  getVariantByOptions(productId: string, sizeId: string | null, colorId: string | null): Observable<ApiResponse<ProductVariant | null>> {
    return this.getVariantsByProductId(productId).pipe(
      map((res) => {
        const found = res.data.find((v) => v.sizeId === sizeId && v.colorId === colorId) ?? null;
        return { success: true, message: 'OK', data: found };
      }),
    );
  }

  getAvailableColors(productId: string): Observable<ApiResponse<string[]>> {
    return this.getVariantsByProductId(productId).pipe(
      map((res) => {
        const colors = [...new Set(res.data.filter((v) => v.colorId).map((v) => v.colorId!))];
        return { success: true, message: 'OK', data: colors };
      }),
    );
  }

  getAvailableSizes(productId: string): Observable<ApiResponse<string[]>> {
    return this.getVariantsByProductId(productId).pipe(
      map((res) => {
        const sizes = [...new Set(res.data.filter((v) => v.sizeId).map((v) => v.sizeId!))];
        return { success: true, message: 'OK', data: sizes };
      }),
    );
  }

  checkVariantStock(productId: string, sizeId: string | null, colorId: string | null): Observable<ApiResponse<number>> {
    return this.getVariantByOptions(productId, sizeId, colorId).pipe(
      map((res) => ({
        success: true,
        message: 'OK',
        data: res.data?.stockQuantity ?? 0,
      })),
    );
  }
}
