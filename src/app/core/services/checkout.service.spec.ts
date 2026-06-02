import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CheckoutService } from './checkout.service';
import { ApiService } from './api.service';
import { CouponService } from './coupon.service';
import { OrderCreateRequest } from '../models/checkout.model';

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CheckoutService,
        { provide: ApiService, useValue: { post: () => { throw new Error('not mocked'); }, get: () => { throw new Error('not mocked'); } } },
        {
          provide: CouponService,
          useValue: {
            getCouponSync: (code: string) => {
              const coupons: Record<string, { discountType: string; discountValue: number; enabled: boolean; endDate: string; maxUses: number | null; usedCount: number }> = {
                SAVE10: { discountType: 'PERCENTAGE', discountValue: 10, enabled: true, endDate: '2030-12-31T23:59:59Z', maxUses: 500, usedCount: 120 },
                WELCOME25: { discountType: 'FIXED', discountValue: 25, enabled: true, endDate: '2030-12-31T23:59:59Z', maxUses: 100, usedCount: 10 },
                FREESHIP: { discountType: 'FREE_SHIPPING', discountValue: 0, enabled: true, endDate: '2030-12-31T23:59:59Z', maxUses: 1000, usedCount: 450 },
              };
              const match = coupons[code.toUpperCase()];
              return match ? { code: code.toUpperCase(), ...match } : null;
            },
          },
        },
      ],
    });
    service = TestBed.inject(CheckoutService);
  });

  function createOrderRequest(overrides?: Partial<OrderCreateRequest>): OrderCreateRequest {
    return {
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '123456789',
      telegramUsername: '@test',
      shippingAddress: '123 Test St',
      note: '',
      shippingMethodId: 'sm-1',
      shippingMethodName: 'Standard',
      shippingZoneId: null,
      shippingZoneName: null,
      paymentMethodId: 'cod',
      paymentMethodName: 'COD',
      couponCode: null,
      items: [],
      subtotal: 100,
      customizationFeeTotal: 0,
      discount: 0,
      deliveryFee: 10,
      tax: 0,
      grandTotal: 110,
      totalItems: 2,
      ...overrides,
    };
  }

  describe('validateOrderBeforeCreate', () => {
    it('should return valid result in mock/fake mode', async () => {
      const request = createOrderRequest();
      const res = await firstValueFrom(service.validateOrderBeforeCreate(request));
      expect(res.success).toBe(true);
      expect(res.data?.valid).toBe(true);
      expect(res.data?.errors).toEqual([]);
      expect(res.data?.serverPrices).toBeDefined();
      expect(res.data?.serverPrices.grandTotal).toBe(110);
    });

    it('should accept server prices from the request in mock mode', async () => {
      const request = createOrderRequest({ subtotal: 200, deliveryFee: 20, grandTotal: 220 });
      const res = await firstValueFrom(service.validateOrderBeforeCreate(request));
      expect(res.data?.serverPrices.subtotal).toBe(200);
      expect(res.data?.serverPrices.deliveryFee).toBe(20);
      expect(res.data?.serverPrices.grandTotal).toBe(220);
    });
  });

  describe('calculateCheckoutSummary', () => {
    it('should calculate subtotal and grand total without coupon', () => {
      const items = [
        { unitPrice: 25, quantity: 2, customizationFee: 0 } as any,
        { unitPrice: 10, quantity: 1, customizationFee: 5 } as any,
      ];
      const summary = service.calculateCheckoutSummary(items, 15);
      expect(summary.subtotal).toBe(60);
      expect(summary.customizationFeeTotal).toBe(5);
      expect(summary.deliveryFee).toBe(15);
      expect(summary.grandTotal).toBe(80);
      expect(summary.totalItems).toBe(3);
    });

    it('should apply percentage coupon discount', () => {
      const items = [{ unitPrice: 100, quantity: 1, customizationFee: 0 } as any];
      const summary = service.calculateCheckoutSummary(items, 10, 'SAVE10');
      expect(summary.discount).toBe(10);
      expect(summary.grandTotal).toBe(100);
    });

    it('should apply fixed coupon discount', () => {
      const items = [{ unitPrice: 100, quantity: 1, customizationFee: 0 } as any];
      const summary = service.calculateCheckoutSummary(items, 10, 'WELCOME25');
      expect(summary.discount).toBe(25);
      expect(summary.grandTotal).toBe(85);
    });

    it('should handle free shipping coupon', () => {
      const items = [{ unitPrice: 50, quantity: 1, customizationFee: 0 } as any];
      const summary = service.calculateCheckoutSummary(items, 15, 'FREESHIP');
      expect(summary.discount).toBe(0);
      expect(summary.deliveryFee).toBe(15);
      expect(summary.grandTotal).toBe(65);
    });
  });

  describe('buildOrderPayload', () => {
    it('should build payload matching the input request structure', () => {
      const payload = service.buildOrderPayload({
        customer: { name: 'Alice', email: 'alice@test.com', phone: '123', telegramUsername: '@alice', address: '456 Oak Ave', note: 'Leave at door' },
        shipping: { shippingMethodId: 'sm-2', shippingMethodName: 'Express', shippingZoneId: 'sz-1', shippingZoneName: 'Zone A', deliveryFee: 20 },
        payment: { paymentMethodId: 'bank-transfer', paymentMethodName: 'Bank Transfer' },
        couponCode: 'SAVE10',
        items: [{ productId: 'p1', productName: 'T-Shirt', productSlug: 't-shirt', unitPrice: 30, quantity: 2, subtotal: 60, selectedSize: null, selectedColor: null, selectedDecorationMethod: null, selectedPrintPosition: null, uploadedDesignFiles: [], selectedPrintColors: [], customizationFee: 0, productionTime: null, id: 'ci-1', productImage: '', maxQuantity: 10, stockQuantity: 10, salePrice: null }],
      });
      expect(payload.customerName).toBe('Alice');
      expect(payload.customerEmail).toBe('alice@test.com');
      expect(payload.shippingMethodId).toBe('sm-2');
      expect(payload.couponCode).toBe('SAVE10');
      expect(payload.items.length).toBe(1);
      expect(payload.subtotal).toBe(60);
      expect(payload.deliveryFee).toBe(20);
    });
  });
});
