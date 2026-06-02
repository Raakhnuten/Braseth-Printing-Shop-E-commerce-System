import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '../../core/models/order.model';
import {
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getShippingStatusLabel,
  getOrderStatusSeverity,
  canCancelOrder,
  ORDER_STATUS_LABELS,
} from './order-status.util';

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord-1',
    orderNumber: 'ORD-0001',
    userId: 'user-1',
    customerName: 'Test',
    email: 'test@test.com',
    phone: '',
    telegramUsername: '',
    address: '123 St',
    note: '',
    items: [],
    subtotal: 100,
    discount: 0,
    deliveryFee: 10,
    customizationFeeTotal: 0,
    tax: 0,
    grandTotal: 110,
    totalItems: 1,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    shippingStatus: ShippingStatus.NOT_SHIPPED,
    paymentMethodId: 'cod',
    paymentMethodName: 'COD',
    paymentTransactionId: null,
    paymentProofUrl: null,
    shippingMethodId: 'sm-1',
    shippingMethodName: 'Standard',
    shippingZoneId: null,
    shippingZoneName: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('getOrderStatusLabel', () => {
  it('should return human-readable label for each status', () => {
    expect(getOrderStatusLabel(OrderStatus.PENDING)).toBe('Pending');
    expect(getOrderStatusLabel(OrderStatus.CONFIRMED)).toBe('Confirmed');
    expect(getOrderStatusLabel(OrderStatus.PROCESSING)).toBe('Processing');
    expect(getOrderStatusLabel(OrderStatus.SHIPPED)).toBe('Shipped');
    expect(getOrderStatusLabel(OrderStatus.DELIVERED)).toBe('Delivered');
    expect(getOrderStatusLabel(OrderStatus.CANCELLED)).toBe('Cancelled');
  });

  it('should return fallback for unknown status', () => {
    expect(getOrderStatusLabel('UNKNOWN' as OrderStatus)).toBe('UNKNOWN');
  });
});

describe('getPaymentStatusLabel', () => {
  it('should return human-readable label', () => {
    expect(getPaymentStatusLabel(PaymentStatus.PAID)).toBe('Paid');
    expect(getPaymentStatusLabel(PaymentStatus.PENDING)).toBe('Pending');
    expect(getPaymentStatusLabel(PaymentStatus.FAILED)).toBe('Failed');
  });
});

describe('getShippingStatusLabel', () => {
  it('should return human-readable label', () => {
    expect(getShippingStatusLabel(ShippingStatus.IN_TRANSIT)).toBe('In Transit');
    expect(getShippingStatusLabel(ShippingStatus.NOT_SHIPPED)).toBe('Not Shipped');
    expect(getShippingStatusLabel(ShippingStatus.DELIVERED)).toBe('Delivered');
  });
});

describe('getOrderStatusSeverity', () => {
  it('should return CSS class for each status', () => {
    expect(getOrderStatusSeverity(OrderStatus.PENDING)).toBe('status-pending');
    expect(getOrderStatusSeverity(OrderStatus.CANCELLED)).toBe('status-cancelled');
  });
});

describe('canCancelOrder', () => {
  it('should return true for PENDING orders', () => {
    const order = createOrder({ status: OrderStatus.PENDING });
    expect(canCancelOrder(order)).toBe(true);
  });

  it('should return true for CONFIRMED orders', () => {
    const order = createOrder({ status: OrderStatus.CONFIRMED });
    expect(canCancelOrder(order)).toBe(true);
  });

  it('should return true for PROCESSING orders', () => {
    const order = createOrder({ status: OrderStatus.PROCESSING });
    expect(canCancelOrder(order)).toBe(true);
  });

  it('should return false for SHIPPED orders', () => {
    const order = createOrder({ status: OrderStatus.SHIPPED });
    expect(canCancelOrder(order)).toBe(false);
  });

  it('should return false for DELIVERED orders', () => {
    const order = createOrder({ status: OrderStatus.DELIVERED });
    expect(canCancelOrder(order)).toBe(false);
  });

  it('should return false for CANCELLED orders', () => {
    const order = createOrder({ status: OrderStatus.CANCELLED });
    expect(canCancelOrder(order)).toBe(false);
  });

  it('should return false for REFUNDED orders', () => {
    const order = createOrder({ status: OrderStatus.REFUNDED });
    expect(canCancelOrder(order)).toBe(false);
  });

  it('should return false for READY orders', () => {
    const order = createOrder({ status: OrderStatus.READY });
    expect(canCancelOrder(order)).toBe(false);
  });
});
