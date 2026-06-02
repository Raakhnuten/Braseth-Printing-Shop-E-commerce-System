import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ProductFeatureControl,
  ProductPrintPosition,
  ProductPriceBreak,
  ProductProductionTime,
  ProductCustomizationFee,
  PrintColor,
} from '../models/customization.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiService } from './api.service';
import { MOCK_PRODUCT_FEATURE_CONTROLS } from '../../mock-data/mock-product-feature-controls';
import { MOCK_PRODUCT_PRINT_POSITIONS } from '../../mock-data/mock-product-print-positions';
import { MOCK_PRODUCT_PRICE_BREAKS } from '../../mock-data/mock-product-price-breaks';
import { MOCK_PRODUCT_PRODUCTION_TIMES } from '../../mock-data/mock-product-production-times';
import { MOCK_PRODUCT_CUSTOMIZATION_FEES } from '../../mock-data/mock-product-customization-fees';
import { MOCK_PRINT_COLORS } from '../../mock-data/mock-print-colors';

export interface CustomizationPayload {
  productId: string;
  quantity: number;
  decorationMethodId: string | null;
  printPositionId: string | null;
  printColorIds: string[];
  isMultipleColors: boolean;
}

export interface CustomizationTotal {
  basePrice: number;
  decorationFee: number;
  positionFee: number;
  printColorFee: number;
  multiColorFee: number;
  customizationFees: number;
  quantityDiscount: number;
  unitPrice: number;
  totalPrice: number;
  productionDays: number;
}

@Injectable({ providedIn: 'root' })
export class ProductCustomizationService {
  constructor(private apiService: ApiService) {}

  // TODO: GET /api/product-feature-controls/product/:productId
  getFeatureControl(productId: string): Observable<ApiResponse<ProductFeatureControl | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const control = MOCK_PRODUCT_FEATURE_CONTROLS.find((c) => c.productId === productId) ??
        MOCK_PRODUCT_FEATURE_CONTROLS.find((c) => c.productId === 'default') ?? null;
      return of({ success: true, message: 'OK', data: control });
    }
    return this.apiService.get<ApiResponse<ProductFeatureControl>>(`/product-feature-controls/product/${productId}`);
  }

  // TODO: GET /api/product-print-positions/product/:productId
  getPrintPositions(productId: string): Observable<ApiResponse<ProductPrintPosition[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const positions = MOCK_PRODUCT_PRINT_POSITIONS.filter((p) => p.productId === productId);
      return of({ success: true, message: 'OK', data: positions });
    }
    return this.apiService.get<ApiResponse<ProductPrintPosition[]>>(`/product-print-positions/product/${productId}`);
  }

  // TODO: GET /api/product-price-breaks/product/:productId
  getPriceBreaks(productId: string): Observable<ApiResponse<ProductPriceBreak[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const breaks = MOCK_PRODUCT_PRICE_BREAKS.filter((p) => p.productId === productId);
      return of({ success: true, message: 'OK', data: breaks });
    }
    return this.apiService.get<ApiResponse<ProductPriceBreak[]>>(`/product-price-breaks/product/${productId}`);
  }

  // TODO: GET /api/product-production-times/product/:productId
  getProductionTime(productId: string): Observable<ApiResponse<ProductProductionTime | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const time = MOCK_PRODUCT_PRODUCTION_TIMES.find((p) => p.productId === productId) ?? null;
      return of({ success: true, message: 'OK', data: time });
    }
    return this.apiService.get<ApiResponse<ProductProductionTime>>(`/product-production-times/product/${productId}`);
  }

  // TODO: GET /api/product-customization-fees/product/:productId
  getCustomizationFees(productId: string): Observable<ApiResponse<ProductCustomizationFee[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const fees = MOCK_PRODUCT_CUSTOMIZATION_FEES.filter((f) => f.productId === productId);
      return of({ success: true, message: 'OK', data: fees });
    }
    return this.apiService.get<ApiResponse<ProductCustomizationFee[]>>(`/product-customization-fees/product/${productId}`);
  }

  // TODO: GET /api/product-print-colors/product/:productId
  // TODO: POST /api/product-feature-controls
  createFeatureControl(control: ProductFeatureControl): Observable<ApiResponse<ProductFeatureControl | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[ProductCustomizationService] createFeatureControl not supported in mock/fake data mode');
      return of({ success: true, message: 'OK', data: null });
    }
    return this.apiService.post<ApiResponse<ProductFeatureControl>>(
      API_ENDPOINTS.FEATURE_CONTROLS.CREATE,
      control,
    );
  }

  // TODO: PUT /api/product-feature-controls/:id
  updateFeatureControl(id: string, control: Partial<ProductFeatureControl>): Observable<ApiResponse<ProductFeatureControl | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[ProductCustomizationService] updateFeatureControl not supported in mock/fake data mode');
      return of({ success: true, message: 'OK', data: null });
    }
    return this.apiService.put<ApiResponse<ProductFeatureControl>>(
      API_ENDPOINTS.FEATURE_CONTROLS.UPDATE(id),
      control,
    );
  }

  getPrintColors(productId: string): Observable<ApiResponse<PrintColor[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of({ success: true, message: 'OK', data: MOCK_PRINT_COLORS });
    }
    return this.apiService.get<ApiResponse<PrintColor[]>>(`/product-print-colors/product/${productId}`);
  }

  calculateCustomizationTotal(payload: CustomizationPayload, basePrice: number, decorationBaseFee: number, positionExtraFee: number): CustomizationTotal {
    const decorationFee = decorationBaseFee;
    const positionFee = positionExtraFee;
    const printColorFee = payload.printColorIds.length > 1 ? (payload.printColorIds.length - 1) * 0.5 : 0;
    const multiColorFee = payload.isMultipleColors ? 2 : 0;

    const customizationFeesTotal = this.getMockCustomizationFees(payload.productId)
      .filter((f) => f.isActive)
      .reduce((sum, f) => sum + f.amount, 0);

    const subtotal = basePrice + decorationFee + positionFee + printColorFee + multiColorFee + customizationFeesTotal;

    const applicableBreak = this.getMockPriceBreaks(payload.productId)
      .filter((b) => b.isActive)
      .find((b) => payload.quantity >= b.minQuantity && (b.maxQuantity === null || payload.quantity <= b.maxQuantity));

    const quantityDiscount = applicableBreak ? applicableBreak.discountPercentage : 0;
    const unitPrice = subtotal * (1 - quantityDiscount / 100);
    const totalPrice = unitPrice * payload.quantity;

    const productionTime = this.getMockProductionTime(payload.productId);
    const productionDays = productionTime ? productionTime.maxDays : 0;

    return {
      basePrice,
      decorationFee,
      positionFee,
      printColorFee,
      multiColorFee,
      customizationFees: customizationFeesTotal,
      quantityDiscount,
      unitPrice,
      totalPrice,
      productionDays,
    };
  }

  calculatePriceByQuantity(productId: string, quantity: number, basePrice: number): { unitPrice: number; discountPercentage: number } {
    const breaks = this.getMockPriceBreaks(productId).filter((b) => b.isActive);
    const applicable = breaks.find((b) => quantity >= b.minQuantity && (b.maxQuantity === null || quantity <= b.maxQuantity));
    const discount = applicable ? applicable.discountPercentage : 0;
    return { unitPrice: basePrice * (1 - discount / 100), discountPercentage: discount };
  }

  validateDesignUpload(file: File, productId: string): { valid: boolean; message: string } {
    const control = MOCK_PRODUCT_FEATURE_CONTROLS.find((c) => c.productId === productId) ??
      MOCK_PRODUCT_FEATURE_CONTROLS.find((c) => c.productId === 'default');

    if (!control) return { valid: true, message: 'OK' };

    const maxSizeBytes = control.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, message: `File size exceeds ${control.maxFileSizeMb}MB limit.` };
    }

    if (control.allowedFileTypes.length > 0 && !control.allowedFileTypes.includes(file.type)) {
      return { valid: false, message: `File type not allowed. Allowed: ${control.allowedFileTypes.join(', ')}` };
    }

    return { valid: true, message: 'OK' };
  }

  private getMockCustomizationFees(productId: string): ProductCustomizationFee[] {
    return MOCK_PRODUCT_CUSTOMIZATION_FEES.filter((f) => f.productId === productId);
  }

  private getMockPriceBreaks(productId: string): ProductPriceBreak[] {
    return MOCK_PRODUCT_PRICE_BREAKS.filter((p) => p.productId === productId);
  }

  private getMockProductionTime(productId: string): ProductProductionTime | null {
    return MOCK_PRODUCT_PRODUCTION_TIMES.find((p) => p.productId === productId) ?? null;
  }
}
