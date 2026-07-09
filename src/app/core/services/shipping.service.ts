import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ShippingMethod, ShippingZone } from '../models/shipping.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiService } from './api.service';
import { MOCK_SHIPPING_METHODS } from '../../mock-data/mock-shipping-methods';
import { MOCK_SHIPPING_ZONES } from '../../mock-data/mock-shipping-zones';

@Injectable({ providedIn: 'root' })
export class ShippingService {
  constructor(private apiService: ApiService) {}

  // TODO: GET /api/shipping-methods
  getShippingMethods(): Observable<ApiResponse<ShippingMethod[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'OK', data: this.getMockShippingMethods() });
    }
    return this.apiService.get<ApiResponse<ShippingMethod[]>>(API_ENDPOINTS.SHIPPING_METHODS.GET_ALL);
  }

  getActiveShippingMethods(): Observable<ApiResponse<ShippingMethod[]>> {
    return this.getShippingMethods().pipe(
      map((res) => ({
        ...res,
        data: res.data.filter((m) => m.isActive),
      })),
    );
  }

  // TODO: GET /api/shipping-methods/:id
  getShippingMethodById(id: string): Observable<ApiResponse<ShippingMethod | null>> {
    return this.getShippingMethods().pipe(
      map((res) => {
        const found = res.data.find((m) => m.id === id) ?? null;
        return { success: true, message: 'OK', data: found };
      }),
    );
  }

  // TODO: GET /api/shipping-zones
  getShippingZones(): Observable<ApiResponse<ShippingZone[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'OK', data: this.getMockShippingZones() });
    }
    return this.apiService.get<ApiResponse<ShippingZone[]>>(API_ENDPOINTS.SHIPPING_ZONES.GET_ALL);
  }

  getActiveShippingZones(): Observable<ApiResponse<ShippingZone[]>> {
    return this.getShippingZones().pipe(
      map((res) => ({
        ...res,
        data: res.data.filter((z) => z.isActive),
      })),
    );
  }

  // TODO: GET /api/shipping-zones/:id
  getShippingZoneById(id: string): Observable<ApiResponse<ShippingZone | null>> {
    return this.getShippingZones().pipe(
      map((res) => {
        const found = res.data.find((z) => z.id === id) ?? null;
        return { success: true, message: 'OK', data: found };
      }),
    );
  }

  // TODO: POST /api/shipping/calculate
  calculateDeliveryFee(methodId: string, zoneId: string | null): number {
    const method = this.getMockShippingMethods().find((m) => m.id === methodId);
    if (!method) return 0;

    if (zoneId) {
      const zone = this.getMockShippingZones().find((z) => z.id === zoneId);
      if (zone) {
        return method.baseFee + zone.fee;
      }
    }

    return method.baseFee;
  }

  // TODO: POST /api/shipping-methods
  createShippingMethod(method: Partial<ShippingMethod>): Observable<ApiResponse<ShippingMethod | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const newMethod: ShippingMethod = {
        id: 'sm-' + Date.now().toString(36),
        name: method.name ?? '',
        code: method.code ?? '',
        description: method.description ?? '',
        baseFee: method.baseFee ?? 0,
        isActive: method.isActive ?? true,
        estimatedDeliveryTime: method.estimatedDeliveryTime ?? '',
        sortOrder: method.sortOrder ?? 0,
      };
      return of({ success: true, message: 'Created (mock)', data: newMethod });
    }
    return this.apiService.post<ApiResponse<ShippingMethod>>(API_ENDPOINTS.SHIPPING_METHODS.CREATE, method);
  }

  // TODO: PUT /api/shipping-methods/:id
  updateShippingMethod(id: string, method: Partial<ShippingMethod>): Observable<ApiResponse<ShippingMethod | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'Updated (mock)', data: null });
    }
    return this.apiService.put<ApiResponse<ShippingMethod>>(API_ENDPOINTS.SHIPPING_METHODS.UPDATE(id), method);
  }

  // TODO: DELETE /api/shipping-methods/:id
  deleteShippingMethod(id: string): Observable<ApiResponse<void>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'Deleted (mock)', data: undefined });
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.SHIPPING_METHODS.DELETE(id));
  }

  // TODO: POST /api/shipping-zones
  createShippingZone(zone: Partial<ShippingZone>): Observable<ApiResponse<ShippingZone | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const newZone: ShippingZone = {
        id: 'sz-' + Date.now().toString(36),
        name: zone.name ?? '',
        code: zone.code ?? '',
        description: zone.description ?? '',
        fee: zone.fee ?? 0,
        isActive: zone.isActive ?? true,
        sortOrder: zone.sortOrder ?? 0,
      };
      return of({ success: true, message: 'Created (mock)', data: newZone });
    }
    return this.apiService.post<ApiResponse<ShippingZone>>(API_ENDPOINTS.SHIPPING_ZONES.CREATE, zone);
  }

  // TODO: PUT /api/shipping-zones/:id
  updateShippingZone(id: string, zone: Partial<ShippingZone>): Observable<ApiResponse<ShippingZone | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'Updated (mock)', data: null });
    }
    return this.apiService.put<ApiResponse<ShippingZone>>(API_ENDPOINTS.SHIPPING_ZONES.UPDATE(id), zone);
  }

  // TODO: DELETE /api/shipping-zones/:id
  deleteShippingZone(id: string): Observable<ApiResponse<void>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'Deleted (mock)', data: undefined });
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.SHIPPING_ZONES.DELETE(id));
  }

  private getMockShippingMethods(): ShippingMethod[] {
    return MOCK_SHIPPING_METHODS;
  }

  private getMockShippingZones(): ShippingZone[] {
    return MOCK_SHIPPING_ZONES;
  }
}
