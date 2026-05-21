export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  type: PaymentMethodType;
  enabled: boolean;
  sortOrder: number;
  config: PaymentMethodConfig;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethodType {
  CARD = 'CARD',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  COD = 'COD',
}

export interface PaymentMethodConfig {
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  sandboxMode?: boolean;
  metadata?: Record<string, string>;
}