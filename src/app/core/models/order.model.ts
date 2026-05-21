export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ShippingStatus {
  NOT_SHIPPED = 'NOT_SHIPPED',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItemDesignFile {
  id: string;
  orderItemId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface OrderItemSizeQuantity {
  id: string;
  orderItemId: string;
  sizeId: string;
  sizeName: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  selectedSize: string | null;
  selectedColor: string | null;
  selectedDecorationMethod: string | null;
  selectedPrintPosition: string | null;
  selectedPrintColors: { colorId: string; colorName: string; colorHex: string }[];
  uploadedDesignFiles: OrderItemDesignFile[];
  customizationFee: number;
  productionTime: number | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  telegramUsername: string;
  address: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  customizationFeeTotal: number;
  tax: number;
  grandTotal: number;
  totalItems: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentTransactionId: string | null;
  paymentProofUrl: string | null;
  shippingMethodId: string;
  shippingMethodName: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  createdAt: string;
  updatedAt: string;
}
