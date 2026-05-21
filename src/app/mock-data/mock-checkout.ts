import { CheckoutSummary, CouponValidationResult } from '../core/models/checkout.model';

export const MOCK_CHECKOUT_SUMMARY: CheckoutSummary = {
  subtotal: 449.97,
  discount: 45.00,
  deliveryFee: 0,
  customizationFeeTotal: 3.00,
  tax: 0,
  grandTotal: 407.97,
  totalItems: 3,
};

export const MOCK_COUPON_VALID: CouponValidationResult = {
  valid: true,
  code: 'SAVE10',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  message: 'Coupon applied successfully.',
};

export const MOCK_COUPON_FREE_SHIPPING: CouponValidationResult = {
  valid: true,
  code: 'FREESHIP',
  discountType: 'FREE_SHIPPING',
  discountValue: 0,
  message: 'Free shipping applied.',
};

export const MOCK_COUPON_FIXED: CouponValidationResult = {
  valid: true,
  code: 'WELCOME25',
  discountType: 'FIXED',
  discountValue: 25,
  message: '$25 discount applied.',
};

export const MOCK_COUPON_INVALID: CouponValidationResult = {
  valid: false,
  code: 'INVALID',
  discountType: null,
  discountValue: 0,
  message: 'Invalid coupon code.',
};
