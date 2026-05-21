import { PaymentMethod, PaymentMethodType, PaymentMethodConfig } from '../../models/payment-method.model';
import { PaymentMethodResponseDto, CreatePaymentMethodRequestDto } from '../../models/dto/payment-method.dto';

export function mapPaymentMethodDtoToPaymentMethod(dto: PaymentMethodResponseDto): PaymentMethod {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    type: dto.type as PaymentMethodType,
    enabled: dto.enabled,
    sortOrder: dto.sortOrder,
    config: (dto.config || {}) as PaymentMethodConfig,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapCreatePaymentMethodToDto(pm: Partial<PaymentMethod>): CreatePaymentMethodRequestDto {
  return {
    name: pm.name || '',
    description: pm.description || '',
    type: pm.type || PaymentMethodType.COD,
    enabled: pm.enabled ?? true,
    sortOrder: pm.sortOrder ?? 0,
    config: pm.config || {},
  };
}
