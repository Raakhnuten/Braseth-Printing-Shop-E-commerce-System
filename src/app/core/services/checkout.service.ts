import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItem, Cart } from '../models/cart.model';
import {
  CheckoutRequest,
  CheckoutSummary,
  OrderCreateRequest,
  OrderCreateItemRequest,
  CouponValidationResult,
} from '../models/checkout.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiService } from './api.service';
import { CouponService } from './coupon.service';
import { Order, OrderStatus, PaymentStatus, ShippingStatus, OrderItem } from '../models/order.model';
import { MOCK_ORDERS } from '../../mock-data/mock-orders';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(
    private apiService: ApiService,
    private couponService: CouponService,
  ) {}

  // ─── Checkout Summary ──────────────────────────────────

  calculateCheckoutSummary(
    items: CartItem[],
    deliveryFee: number,
    couponCode: string | null = null,
  ): CheckoutSummary {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const customizationFeeTotal = items.reduce(
      (sum, item) => sum + (item.customizationFee || 0) * item.quantity,
      0,
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    let discount = 0;
    // TODO: integrate real coupon validation from backend
    if (couponCode) {
      const couponResult = this.validateCouponSync(couponCode);
      if (couponResult.valid) {
        if (couponResult.discountType === 'PERCENTAGE') {
          discount = subtotal * (couponResult.discountValue / 100);
        } else if (couponResult.discountType === 'FIXED') {
          discount = couponResult.discountValue;
        } else if (couponResult.discountType === 'FREE_SHIPPING') {
          discount = 0;
        }
      }
    }

    const tax = 0; // TODO: integrate tax calculation from backend
    const grandTotal = subtotal + customizationFeeTotal + deliveryFee - discount + tax;

    return {
      subtotal,
      discount,
      deliveryFee,
      customizationFeeTotal,
      tax,
      grandTotal,
      totalItems,
    };
  }

  // ─── Coupon Validation ─────────────────────────────────

  // TODO: GET /api/coupons/validate/:code
  validateCoupon(code: string): Observable<ApiResponse<CouponValidationResult>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const result = this.validateCouponSync(code);
      return of({ success: true, message: result.message, data: result });
    }
    return this.apiService.get<ApiResponse<CouponValidationResult>>(
      API_ENDPOINTS.COUPONS.VALIDATE(code),
    );
  }

  private validateCouponSync(code: string): CouponValidationResult {
    const upperCode = code.toUpperCase();
    const mockCoupons: Record<string, { type: string; value: number }> = {
      SAVE10: { type: 'PERCENTAGE', value: 10 },
      FREESHIP: { type: 'FREE_SHIPPING', value: 0 },
      WELCOME25: { type: 'FIXED', value: 25 },
    };

    const match = mockCoupons[upperCode];
    if (match) {
      return {
        valid: true,
        code: upperCode,
        discountType: match.type as 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING',
        discountValue: match.value,
        message: 'Coupon applied successfully.',
      };
    }

    return {
      valid: false,
      code: upperCode,
      discountType: null,
      discountValue: 0,
      message: 'Invalid coupon code.',
    };
  }

  // ─── Order Creation ────────────────────────────────────

  // TODO: POST /api/orders
  createOrder(request: OrderCreateRequest): Observable<ApiResponse<{ orderId: string; orderNumber: string }>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const now = new Date().toISOString();
      const id = 'ord-' + Date.now().toString(36);
      const orderNumber = 'ORD-2026-' + String(Math.floor(Math.random() * 9000 + 1000));

      const items: OrderItem[] = request.items.map((item, idx) => ({
        id: 'oi-' + id + '-' + idx,
        orderId: id,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        productImage: '',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        selectedDecorationMethod: item.selectedDecorationMethod,
        selectedPrintPosition: item.selectedPrintPosition,
        selectedPrintColors: item.selectedPrintColors,
        uploadedDesignFiles: (item.uploadedDesignFiles || []).map((f, fIdx) => ({
          id: 'df-' + id + '-' + idx + '-' + fIdx,
          orderItemId: 'oi-' + id + '-' + idx,
          fileName: f.fileName,
          fileUrl: '',
          fileType: f.fileType,
          fileSize: f.fileSize,
          uploadedAt: now,
        })),
        customizationFee: item.customizationFee,
        productionTime: item.productionTime,
      }));

      const newOrder: Order = {
        id,
        orderNumber,
        userId: '',
        customerName: request.customerName,
        email: request.customerEmail,
        phone: request.customerPhone,
        telegramUsername: request.telegramUsername,
        address: request.shippingAddress,
        note: request.note,
        items,
        subtotal: request.subtotal,
        discount: request.discount,
        deliveryFee: request.deliveryFee,
        customizationFeeTotal: request.customizationFeeTotal,
        tax: request.tax,
        grandTotal: request.grandTotal,
        totalItems: request.totalItems,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        shippingStatus: ShippingStatus.NOT_SHIPPED,
        paymentMethodId: request.paymentMethodId,
        paymentMethodName: request.paymentMethodName,
        paymentTransactionId: null,
        paymentProofUrl: null,
        shippingMethodId: request.shippingMethodId,
        shippingMethodName: request.shippingMethodName,
        shippingZoneId: request.shippingZoneId,
        shippingZoneName: null,
        createdAt: now,
        updatedAt: now,
      };

      MOCK_ORDERS.push(newOrder);

      return of({
        success: true,
        message: 'Order created successfully (mock)',
        data: { orderId: id, orderNumber },
      });
    }
    return this.apiService.post<ApiResponse<{ orderId: string; orderNumber: string }>>(
      API_ENDPOINTS.ORDERS.CREATE,
      request,
    );
  }

  // ─── Payload Builder ───────────────────────────────────

  buildOrderPayload(checkoutRequest: CheckoutRequest): OrderCreateRequest {
    const items: OrderCreateItemRequest[] = checkoutRequest.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productSlug,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.unitPrice * item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      selectedDecorationMethod: item.selectedDecorationMethod,
      selectedPrintPosition: item.selectedPrintPosition,
      uploadedDesignFiles: item.uploadedDesignFiles.map((f) => ({
        position: f.position,
        fileName: f.fileName,
        fileType: f.fileType,
        fileSize: f.fileSize,
      })),
      selectedPrintColors: item.selectedPrintColors.map((c) => ({
        colorId: c.colorId,
        colorName: c.colorName,
        colorHex: c.colorHex,
      })),
      customizationFee: item.customizationFee,
      productionTime: item.productionTime,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const customizationFeeTotal = items.reduce((sum, item) => sum + item.customizationFee * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    let discount = 0;
    if (checkoutRequest.couponCode) {
      const couponResult = this.validateCouponSync(checkoutRequest.couponCode);
      if (couponResult.valid) {
        if (couponResult.discountType === 'PERCENTAGE') {
          discount = subtotal * (couponResult.discountValue / 100);
        } else if (couponResult.discountType === 'FIXED') {
          discount = couponResult.discountValue;
        }
      }
    }

    const tax = 0; // TODO: integrate tax calculation
    const grandTotal = subtotal + customizationFeeTotal + checkoutRequest.shipping.deliveryFee - discount + tax;

    return {
      customerName: checkoutRequest.customer.name,
      customerEmail: checkoutRequest.customer.email,
      customerPhone: checkoutRequest.customer.phone,
      telegramUsername: checkoutRequest.customer.telegramUsername,
      shippingAddress: checkoutRequest.customer.address,
      note: checkoutRequest.customer.note,
      shippingMethodId: checkoutRequest.shipping.shippingMethodId,
      shippingMethodName: checkoutRequest.shipping.shippingMethodName,
      shippingZoneId: checkoutRequest.shipping.shippingZoneId,
      shippingZoneName: checkoutRequest.shipping.shippingZoneName,
      paymentMethodId: checkoutRequest.payment.paymentMethodId,
      paymentMethodName: checkoutRequest.payment.paymentMethodName,
      couponCode: checkoutRequest.couponCode,
      items,
      subtotal,
      customizationFeeTotal,
      discount,
      deliveryFee: checkoutRequest.shipping.deliveryFee,
      tax,
      grandTotal,
      totalItems,
    };
  }
}
