import { PaymentMethod, PaymentMethodType } from '../core/models/payment-method.model';

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '1',
    name: 'Credit Card',
    description: 'Pay with Visa, Mastercard, or Amex',
    type: PaymentMethodType.CARD,
    enabled: true,
    sortOrder: 1,
    config: {
      sandboxMode: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'PayPal',
    description: 'Fast and secure payment with PayPal',
    type: PaymentMethodType.PAYPAL,
    enabled: true,
    sortOrder: 2,
    config: {
      sandboxMode: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Bank Transfer',
    description: 'Direct bank transfer payment',
    type: PaymentMethodType.BANK_TRANSFER,
    enabled: true,
    sortOrder: 3,
    config: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Cash on Delivery',
    description: 'Pay cash when your order is delivered',
    type: PaymentMethodType.COD,
    enabled: true,
    sortOrder: 4,
    config: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
];