import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, OrderStatus, PaymentStatus } from '../models/order.model';
import { Shipment } from '../models/shipping.model';
import { ApiResponse, ApiMeta, PaginationParams } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_ORDERS } from '../../mock-data/mock-orders';
import { MOCK_SHIPMENTS } from '../../mock-data/mock-shipments';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private apiService: ApiService) {}

  private ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
    return { success: true, message: 'OK', data, meta };
  }

  getOrders(filters?: Partial<PaginationParams>): Observable<ApiResponse<Order[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of(this.ok(MOCK_ORDERS));
    }
    return this.apiService.get<ApiResponse<Order[]>>(API_ENDPOINTS.ORDERS.GET_ALL, filters);
  }

  // TODO: GET /api/orders/my — Backend must return orders for the authenticated user.
  // In mock mode, returns all orders for user-1 to simulate a logged-in user.
  getMyOrders(filters?: Partial<PaginationParams>): Observable<ApiResponse<Order[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const myOrders = MOCK_ORDERS.filter((o) => o.userId === 'user-1');
      return of(this.ok(myOrders));
    }
    return this.apiService.get<ApiResponse<Order[]>>(API_ENDPOINTS.ORDERS.GET_MY, filters);
  }

  getOrderById(id: string): Observable<ApiResponse<Order | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const order = MOCK_ORDERS.find((o) => o.id === id) ?? null;
      return of(this.ok(order));
    }
    return this.apiService.get<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
  }

  getOrdersByUserId(userId: string): Observable<ApiResponse<Order[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const orders = MOCK_ORDERS.filter((o) => o.userId === userId);
      return of(this.ok(orders));
    }
    return this.apiService.get<ApiResponse<Order[]>>(API_ENDPOINTS.ORDERS.GET_ALL, { userId });
  }

  createOrder(order: Partial<Order>): Observable<ApiResponse<Order | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const now = new Date().toISOString();
      const id = 'ord-' + Date.now().toString(36);
      const orderNumber = 'ORD-2026-' + String(Math.floor(Math.random() * 9000 + 1000));
      const newOrder: Order = {
        id,
        orderNumber,
        userId: order.userId ?? '',
        customerName: order.customerName ?? '',
        email: order.email ?? '',
        phone: order.phone ?? '',
        telegramUsername: order.telegramUsername ?? '',
        address: order.address ?? '',
        note: order.note ?? '',
        items: (order.items as any) ?? [],
        subtotal: order.subtotal ?? 0,
        discount: order.discount ?? 0,
        deliveryFee: order.deliveryFee ?? 0,
        customizationFeeTotal: order.customizationFeeTotal ?? 0,
        tax: order.tax ?? 0,
        grandTotal: order.grandTotal ?? 0,
        totalItems: order.totalItems ?? 0,
        status: OrderStatus.PENDING,
        paymentStatus: order.paymentStatus ?? 'PENDING',
        shippingStatus: order.shippingStatus ?? 'NOT_SHIPPED',
        paymentMethodId: order.paymentMethodId ?? '',
        paymentMethodName: order.paymentMethodName ?? '',
        paymentTransactionId: null,
        paymentProofUrl: null,
        shippingMethodId: order.shippingMethodId ?? '',
        shippingMethodName: order.shippingMethodName ?? '',
        shippingZoneId: order.shippingZoneId ?? null,
        shippingZoneName: order.shippingZoneName ?? null,
        createdAt: now,
        updatedAt: now,
      } as Order;
      MOCK_ORDERS.push(newOrder);
      return of(this.ok(newOrder));
    }
    return this.apiService.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.CREATE, order);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<ApiResponse<Order | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const idx = MOCK_ORDERS.findIndex((o) => o.id === id);
      if (idx >= 0) {
        MOCK_ORDERS[idx] = { ...MOCK_ORDERS[idx], status, updatedAt: new Date().toISOString() };
      }
      return of(this.ok(MOCK_ORDERS[idx] ?? null));
    }
    return this.apiService.put<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status });
  }

  // TODO: PUT /api/orders/:id/payment-status — Backend must validate the
  // payment status transition and update the order. Only allowed transitions:
  // PENDING → PAID | FAILED, PAID → REFUNDED, FAILED → PENDING.
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Observable<ApiResponse<Order | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const idx = MOCK_ORDERS.findIndex((o) => o.id === id);
      if (idx >= 0) {
        MOCK_ORDERS[idx] = { ...MOCK_ORDERS[idx], paymentStatus, updatedAt: new Date().toISOString() };
      }
      return of(this.ok(MOCK_ORDERS[idx] ?? null));
    }
    return this.apiService.put<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.UPDATE_PAYMENT_STATUS(id), { paymentStatus });
  }

  cancelOrder(id: string): Observable<ApiResponse<Order | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const idx = MOCK_ORDERS.findIndex((o) => o.id === id);
      if (idx >= 0) {
        MOCK_ORDERS[idx] = { ...MOCK_ORDERS[idx], status: OrderStatus.CANCELLED, updatedAt: new Date().toISOString() };
      }
      return of(this.ok(MOCK_ORDERS[idx] ?? null));
    }
    return this.apiService.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.CANCEL(id), {});
  }

  getOrderItems(orderId: string): Observable<ApiResponse<any[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      return of(this.ok(order?.items ?? []));
    }
    return this.apiService.get<ApiResponse<any[]>>(`/orders/${orderId}/items`);
  }

  // TODO: GET /api/orders/:id/track — Backend must return shipment tracking info.
  // In mock mode, looks up shipment by orderId in mock data.
  trackOrder(orderId: string): Observable<ApiResponse<Shipment | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const shipment = MOCK_SHIPMENTS.find((s) => s.orderId === orderId) ?? null;
      return of({ success: true, message: 'OK', data: shipment });
    }
    return this.apiService.get<ApiResponse<Shipment | null>>(API_ENDPOINTS.ORDERS.TRACK(orderId));
  }
}
