import { Coupon, CouponDiscountType } from '../../models/coupon.model';
import { CouponResponseDto, CreateCouponRequestDto } from '../../models/dto/coupon.dto';

export function mapCouponDtoToCoupon(dto: CouponResponseDto): Coupon {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description,
    discountType: dto.discountType as CouponDiscountType,
    discountValue: dto.discountValue,
    minOrderAmount: dto.minOrderAmount,
    maxUses: dto.maxUses,
    usedCount: dto.usedCount,
    startDate: dto.startDate,
    endDate: dto.endDate,
    enabled: dto.enabled,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapCreateCouponToDto(coupon: Partial<Coupon>): CreateCouponRequestDto {
  return {
    code: coupon.code || '',
    name: coupon.name || '',
    description: coupon.description || '',
    discountType: coupon.discountType || CouponDiscountType.PERCENTAGE,
    discountValue: coupon.discountValue || 0,
    minOrderAmount: coupon.minOrderAmount ?? null,
    maxUses: coupon.maxUses ?? null,
    startDate: coupon.startDate || '',
    endDate: coupon.endDate || '',
    enabled: coupon.enabled ?? true,
  };
}
