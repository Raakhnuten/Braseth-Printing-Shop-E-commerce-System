export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  FREE_SHIPPING = 'FREE_SHIPPING',
}