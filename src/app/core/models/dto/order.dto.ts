import { AddressDto } from './address.dto';

export interface OrderItemDesignFileDto {
  id: string;
  orderItemId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface OrderItemDto {
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
  uploadedDesignFiles: OrderItemDesignFileDto[];
  customizationFee: number;
  productionTime: number | null;
}

export interface OrderResponseDto {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  telegramUsername: string;
  address: string;
  note: string;
  items: OrderItemDto[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  customizationFeeTotal: number;
  tax: number;
  total: number;
  totalItems: number;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
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

export interface CreateOrderRequestDto {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  telegramUsername: string;
  shippingAddress: string;
  note: string;
  shippingMethodId: string;
  shippingMethodName: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  paymentMethodId: string;
  paymentMethodName: string;
  items: {
    productId: string;
    productName: string;
    productSlug: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    selectedSize: string | null;
    selectedColor: string | null;
    selectedDecorationMethod: string | null;
    selectedPrintPosition: string | null;
    uploadedDesignFiles: { position: string; fileName: string; fileType: string; fileSize: number }[];
    selectedPrintColors: { colorId: string; colorName: string; colorHex: string }[];
    customizationFee: number;
    productionTime: number | null;
  }[];
  subtotal: number;
  customizationFeeTotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  totalItems: number;
}

export interface UpdateOrderStatusRequestDto {
  status: string;
}
