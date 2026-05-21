export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  baseFee: number;
  isActive: boolean;
  estimatedDeliveryTime: string;
  sortOrder: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  code: string;
  description: string;
  fee: number;
  isActive: boolean;
  sortOrder: number;
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export interface Shipment {
  id: string;
  orderId: string;
  shipmentNumber: string;
  shippingMethodId: string;
  shippingMethodName: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: ShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}
