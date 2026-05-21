import { CartItem } from './cart.model';

export interface CheckoutCustomerInfo {
  name: string;
  email: string;
  phone: string;
  telegramUsername: string;
  address: string;
  note: string;
}

export interface CheckoutShippingInfo {
  shippingMethodId: string;
  shippingMethodName: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  deliveryFee: number;
}

export interface CheckoutPaymentInfo {
  paymentMethodId: string;
  paymentMethodName: string;
}

export interface CheckoutRequest {
  customer: CheckoutCustomerInfo;
  shipping: CheckoutShippingInfo;
  payment: CheckoutPaymentInfo;
  couponCode: string | null;
  items: CartItem[];
}

export interface OrderCreateItemRequest {
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
}

export interface OrderCreateRequest {
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
  couponCode: string | null;
  items: OrderCreateItemRequest[];
  subtotal: number;
  customizationFeeTotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  totalItems: number;
}

export interface CheckoutSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  customizationFeeTotal: number;
  tax: number;
  grandTotal: number;
  totalItems: number;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | null;
  discountValue: number;
  message: string;
}
