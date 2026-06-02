import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '../../core/models/order.model';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.READY]: 'Ready',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.REFUNDED]: 'Refunded',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pending',
  [PaymentStatus.PAID]: 'Paid',
  [PaymentStatus.FAILED]: 'Failed',
  [PaymentStatus.REFUNDED]: 'Refunded',
};

export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  [ShippingStatus.NOT_SHIPPED]: 'Not Shipped',
  [ShippingStatus.PREPARING]: 'Preparing',
  [ShippingStatus.SHIPPED]: 'Shipped',
  [ShippingStatus.IN_TRANSIT]: 'In Transit',
  [ShippingStatus.DELIVERED]: 'Delivered',
  [ShippingStatus.FAILED]: 'Failed',
  [ShippingStatus.RETURNED]: 'Returned',
  [ShippingStatus.CANCELLED]: 'Cancelled',
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function getShippingStatusLabel(status: ShippingStatus): string {
  return SHIPPING_STATUS_LABELS[status] ?? status;
}

export const ORDER_STATUS_SEVERITY: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'status-pending',
  [OrderStatus.CONFIRMED]: 'status-confirmed',
  [OrderStatus.PROCESSING]: 'status-processing',
  [OrderStatus.READY]: 'status-ready',
  [OrderStatus.SHIPPED]: 'status-shipped',
  [OrderStatus.DELIVERED]: 'status-delivered',
  [OrderStatus.CANCELLED]: 'status-cancelled',
  [OrderStatus.REFUNDED]: 'status-refunded',
};

export const PAYMENT_STATUS_SEVERITY: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'status-pending',
  [PaymentStatus.PAID]: 'status-paid',
  [PaymentStatus.FAILED]: 'status-cancelled',
  [PaymentStatus.REFUNDED]: 'status-refunded',
};

export const SHIPPING_STATUS_SEVERITY: Record<ShippingStatus, string> = {
  [ShippingStatus.NOT_SHIPPED]: 'status-not-shipped',
  [ShippingStatus.PREPARING]: 'status-preparing',
  [ShippingStatus.SHIPPED]: 'status-shipped',
  [ShippingStatus.IN_TRANSIT]: 'status-in-transit',
  [ShippingStatus.DELIVERED]: 'status-delivered',
  [ShippingStatus.FAILED]: 'status-cancelled',
  [ShippingStatus.RETURNED]: 'status-returned',
  [ShippingStatus.CANCELLED]: 'status-cancelled',
};

export function getOrderStatusSeverity(status: OrderStatus): string {
  return ORDER_STATUS_SEVERITY[status] ?? 'status-pending';
}

export function getPaymentStatusSeverity(status: PaymentStatus): string {
  return PAYMENT_STATUS_SEVERITY[status] ?? 'status-pending';
}

export function getShippingStatusSeverity(status: ShippingStatus): string {
  return SHIPPING_STATUS_SEVERITY[status] ?? 'status-not-shipped';
}

/**
 * Orders can be cancelled only when they are in a cancellable state:
 * PENDING, CONFIRMED, or PROCESSING.
 * Once an order is READY, SHIPPED, DELIVERED, CANCELLED, or REFUNDED,
 * cancellation is no longer allowed.
 */
export function canCancelOrder(order: Order): boolean {
  return (
    order.status === OrderStatus.PENDING ||
    order.status === OrderStatus.CONFIRMED ||
    order.status === OrderStatus.PROCESSING
  );
}
