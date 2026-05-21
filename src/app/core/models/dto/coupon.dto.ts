export interface CouponResponseDto {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: string;
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

export interface CreateCouponRequestDto {
  code: string;
  name: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  startDate: string;
  endDate: string;
  enabled: boolean;
}

export type UpdateCouponRequestDto = Partial<CreateCouponRequestDto>;

export interface ApplyCouponRequestDto {
  code: string;
  orderTotal: number;
}

export interface ApplyCouponResponseDto {
  code: string;
  discountType: string;
  discountValue: number;
  discountedTotal: number;
}
