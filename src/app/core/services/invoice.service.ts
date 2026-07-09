import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Invoice, InvoiceStatus } from '../models/invoice.model';
import { ApiResponse, PaginationParams } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiService } from './api.service';
import { MOCK_INVOICES } from '../../mock-data/mock-invoices';
import { MOCK_ORDERS } from '../../mock-data/mock-orders';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  constructor(private apiService: ApiService) {}

  getInvoices(filters?: Partial<PaginationParams>): Observable<ApiResponse<Invoice[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'OK', data: MOCK_INVOICES });
    }
    return this.apiService.get<ApiResponse<Invoice[]>>(API_ENDPOINTS.INVOICES.GET_ALL, filters);
  }

  getInvoiceById(id: string): Observable<ApiResponse<Invoice | null>> {
    return this.getInvoices().pipe(
      map((res: ApiResponse<Invoice[]>) => {
        const found = res.data.find((i: Invoice) => i.id === id) ?? null;
        return { success: true, message: 'OK', data: found };
      }),
    );
  }

  getInvoiceByOrderId(orderId: string): Observable<ApiResponse<Invoice | null>> {
    return this.getInvoices().pipe(
      map((res: ApiResponse<Invoice[]>) => {
        const found = res.data.find((i: Invoice) => i.orderId === orderId) ?? null;
        return { success: true, message: 'OK', data: found };
      }),
    );
  }

  generateInvoice(orderId: string): Observable<ApiResponse<Invoice | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const order = MOCK_ORDERS.find((o) => o.id === orderId);
      if (!order) {
        return of({ success: false, message: 'Order not found', data: null });
      }
      const existing = MOCK_INVOICES.find((i) => i.orderId === orderId);
      if (existing) {
        return of({ success: true, message: 'Invoice already exists', data: existing });
      }
      const now = new Date().toISOString();
      const invoiceNumber = 'INV-2026-' + String(Math.floor(Math.random() * 9000 + 1000));
      const invoice: Invoice = {
        id: 'inv-' + Date.now().toString(36),
        invoiceNumber,
        orderId,
        customerName: order.customerName,
        customerEmail: order.email,
        billingAddress: order.address,
        subtotal: order.subtotal,
        discount: order.discount,
        deliveryFee: order.deliveryFee,
        customizationFeeTotal: order.customizationFeeTotal,
        tax: order.tax,
        grandTotal: order.grandTotal,
        currency: 'USD',
        status: InvoiceStatus.ISSUED,
        issuedAt: now,
        paidAt: null,
        dueAt: null,
        downloadUrl: null,
        createdAt: now,
        updatedAt: now,
      };
      MOCK_INVOICES.push(invoice);
      return of({ success: true, message: 'Invoice generated (mock)', data: invoice });
    }
    return this.apiService.post<ApiResponse<Invoice>>(API_ENDPOINTS.INVOICES.GENERATE(orderId), {});
  }

  markInvoicePaid(invoiceId: string): Observable<ApiResponse<Invoice | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      const idx = MOCK_INVOICES.findIndex((i) => i.id === invoiceId);
      if (idx >= 0) {
        const now = new Date().toISOString();
        MOCK_INVOICES[idx] = { ...MOCK_INVOICES[idx], status: InvoiceStatus.PAID, paidAt: now, updatedAt: now };
      }
      return of({ success: true, message: 'Invoice marked as paid (mock)', data: MOCK_INVOICES[idx] ?? null });
    }
    return this.apiService.post<ApiResponse<Invoice>>(API_ENDPOINTS.INVOICES.MARK_PAID(invoiceId), {});
  }

  downloadInvoice(invoiceId: string): Observable<ApiResponse<{ url: string } | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of({ success: true, message: 'Download initiated (mock)', data: { url: `/api/invoices/${invoiceId}/download` } });
    }
    return this.apiService.get<ApiResponse<{ url: string }>>(API_ENDPOINTS.INVOICES.DOWNLOAD(invoiceId));
  }
}
