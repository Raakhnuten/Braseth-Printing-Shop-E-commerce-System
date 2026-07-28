import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
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

  // TODO: GET /api/product-print-positions/product/:productId
  getPrintPositions(productId: string): Observable<ApiResponse<ProductPrintPosition[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const positions = MOCK_PRODUCT_PRINT_POSITIONS.filter((p) => p.productId === productId);
      return of({ success: true, message: 'OK', data: positions });
    }
    return this.apiService.get<ApiResponse<ProductPrintPosition[]>>(API_ENDPOINTS.PRODUCT_PRINT_POSITIONS.GET_BY_PRODUCT(productId));
  }

  // TODO: GET /api/product-price-breaks/product/:productId
  getPriceBreaks(productId: string): Observable<ApiResponse<ProductPriceBreak[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const breaks = MOCK_PRODUCT_PRICE_BREAKS.filter((p) => p.productId === productId);
      return of({ success: true, message: 'OK', data: breaks });
    }
    return this.apiService.get<ApiResponse<ProductPriceBreak[]>>(API_ENDPOINTS.PRODUCT_PRICE_BREAKS.GET_BY_PRODUCT(productId));
  }

  // TODO: GET /api/product-production-times/product/:productId
  getProductionTime(productId: string): Observable<ApiResponse<ProductProductionTime | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const time = MOCK_PRODUCT_PRODUCTION_TIMES.find((p) => p.productId === productId) ?? null;
      return of({ success: true, message: 'OK', data: time });
    }
    return this.apiService.get<ApiResponse<ProductProductionTime>>(API_ENDPOINTS.PRODUCT_PRODUCTION_TIMES.GET_BY_PRODUCT(productId));
  }

  // TODO: GET /api/product-customization-fees/product/:productId
  getCustomizationFees(productId: string): Observable<ApiResponse<ProductCustomizationFee[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const fees = MOCK_PRODUCT_CUSTOMIZATION_FEES.filter((f) => f.productId === productId);
      return of({ success: true, message: 'OK', data: fees });
    }
    return this.apiService.get<ApiResponse<ProductCustomizationFee[]>>(API_ENDPOINTS.PRODUCT_CUSTOMIZATION_FEES.GET_BY_PRODUCT(productId));
  }

  // TODO: GET /api/product-print-colors/product/:productId
  getPrintColors(productId: string): Observable<ApiResponse<PrintColor[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'OK', data: MOCK_PRINT_COLORS });
    }
    return this.apiService.get<ApiResponse<PrintColor[]>>(API_ENDPOINTS.PRODUCT_PRINT_COLORS.GET_BY_PRODUCT(productId));
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

  // TODO: _productId is reserved for future API-driven per-product upload limits
  validateDesignUpload(file: File, _productId: string): { valid: boolean; message: string } {
    const maxFileSizeMb = 50;
    const allowedFileTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'];

    const maxSizeBytes = maxFileSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, message: `File size exceeds ${maxFileSizeMb}MB limit.` };
    }

    if (!allowedFileTypes.includes(file.type)) {
      return { valid: false, message: `File type not allowed. Allowed: ${allowedFileTypes.join(', ')}` };
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
