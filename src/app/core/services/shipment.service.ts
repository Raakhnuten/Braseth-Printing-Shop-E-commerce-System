import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Shipment, ShipmentStatus } from '../models/shipping.model';
import { ApiResponse, PaginationParams } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiService } from './api.service';
import { MOCK_SHIPMENTS } from '../../mock-data/mock-shipments';

export interface CreateShipmentPayload {
  orderId: string;
  shippingMethodId: string;
  shippingMethodName: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  trackingNumber?: string;
  carrierName?: string;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  constructor(private apiService: ApiService) {}

  getShipments(filters?: Partial<PaginationParams>): Observable<ApiResponse<Shipment[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'OK', data: MOCK_SHIPMENTS });
    }
    return this.apiService.get<ApiResponse<Shipment[]>>(API_ENDPOINTS.SHIPMENTS.GET_ALL, filters);
  }

  getShipmentById(id: string): Observable<ApiResponse<Shipment | null>> {
    return this.getShipments().pipe(
      map((res: ApiResponse<Shipment[]>) => {
        const found = res.data.find((s: Shipment) => s.id === id) ?? null;
        return { success: true, message: 'OK', data: found };
      }),
    );
  }

  getShipmentByOrderId(orderId: string): Observable<ApiResponse<Shipment | null>> {
    return this.getShipments().pipe(
      map((res: ApiResponse<Shipment[]>) => {
        const found = res.data.find((s: Shipment) => s.orderId === orderId) ?? null;
        return { success: true, message: 'OK', data: found };
      }),
    );
  }

  createShipment(payload: CreateShipmentPayload): Observable<ApiResponse<Shipment | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const now = new Date().toISOString();
      const shipmentNumber = 'SHP-2026-' + String(Math.floor(Math.random() * 9000 + 1000));
      const shipment: Shipment = {
        id: 'ship-' + Date.now().toString(36),
        orderId: payload.orderId,
        shipmentNumber,
        shippingMethodId: payload.shippingMethodId,
        shippingMethodName: payload.shippingMethodName,
        shippingZoneId: payload.shippingZoneId,
        shippingZoneName: payload.shippingZoneName,
        carrierName: payload.carrierName ?? null,
        trackingNumber: payload.trackingNumber ?? null,
        trackingUrl: payload.trackingNumber ? `https://track.example.com/${payload.trackingNumber}` : null,
        status: ShipmentStatus.PENDING,
        shippedAt: null,
        deliveredAt: null,
        note: payload.note ?? '',
        createdAt: now,
        updatedAt: now,
      };
      MOCK_SHIPMENTS.push(shipment);
      return of({ success: true, message: 'Created (mock)', data: shipment });
    }
    return this.apiService.post<ApiResponse<Shipment>>(API_ENDPOINTS.SHIPMENTS.CREATE, payload);
  }

  updateShipmentStatus(id: string, status: ShipmentStatus): Observable<ApiResponse<Shipment | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const idx = MOCK_SHIPMENTS.findIndex((s) => s.id === id);
      if (idx >= 0) {
        const now = new Date().toISOString();
        const updates: Partial<Shipment> = { status, updatedAt: now };
        if (status === ShipmentStatus.SHIPPED) updates.shippedAt = now;
        if (status === ShipmentStatus.DELIVERED) updates.deliveredAt = now;
        MOCK_SHIPMENTS[idx] = { ...MOCK_SHIPMENTS[idx], ...updates };
      }
      return of({ success: true, message: `Status updated to ${status} (mock)`, data: MOCK_SHIPMENTS[idx] ?? null });
    }
    return this.apiService.patch<ApiResponse<Shipment>>(API_ENDPOINTS.SHIPMENTS.UPDATE_STATUS(id), { status });
  }

  updateTrackingNumber(id: string, trackingNumber: string): Observable<ApiResponse<Shipment | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const idx = MOCK_SHIPMENTS.findIndex((s) => s.id === id);
      if (idx >= 0) {
        MOCK_SHIPMENTS[idx] = {
          ...MOCK_SHIPMENTS[idx],
          trackingNumber,
          trackingUrl: `https://track.example.com/${trackingNumber}`,
          updatedAt: new Date().toISOString(),
        };
      }
      return of({ success: true, message: 'Tracking updated (mock)', data: MOCK_SHIPMENTS[idx] ?? null });
    }
    return this.apiService.patch<ApiResponse<Shipment>>(API_ENDPOINTS.SHIPMENTS.UPDATE_TRACKING(id), { trackingNumber });
  }

  markAsDelivered(id: string): Observable<ApiResponse<Shipment | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const idx = MOCK_SHIPMENTS.findIndex((s) => s.id === id);
      if (idx >= 0) {
        const now = new Date().toISOString();
        MOCK_SHIPMENTS[idx] = {
          ...MOCK_SHIPMENTS[idx],
          status: ShipmentStatus.DELIVERED,
          deliveredAt: now,
          updatedAt: now,
        };
      }
      return of({ success: true, message: 'Marked as delivered (mock)', data: MOCK_SHIPMENTS[idx] ?? null });
    }
    return this.apiService.post<ApiResponse<Shipment>>(API_ENDPOINTS.SHIPMENTS.MARK_DELIVERED(id), {});
  }
}
