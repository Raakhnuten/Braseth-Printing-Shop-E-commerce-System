export interface PaymentMethodResponseDto {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodRequestDto {
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  sortOrder: number;
  config?: Record<string, any>;
}

export type UpdatePaymentMethodRequestDto = Partial<CreatePaymentMethodRequestDto>;
