import { Order, OrderItem, OrderStatus, PaymentStatus, ShippingStatus } from '../../models/order.model';
import { OrderResponseDto, OrderItemDto } from '../../models/dto/order.dto';

export function mapOrderDtoToOrder(dto: OrderResponseDto): Order {
  return {
    id: dto.id,
    orderNumber: dto.orderNumber,
    userId: dto.userId,
    customerName: dto.customerName,
    email: dto.email,
    phone: dto.phone,
    telegramUsername: dto.telegramUsername,
    address: dto.address,
    note: dto.note,
    items: dto.items.map(mapOrderItemDtoToOrderItem),
    subtotal: dto.subtotal,
    discount: dto.discount,
    deliveryFee: dto.shippingFee,
    customizationFeeTotal: dto.customizationFeeTotal,
    tax: dto.tax,
    grandTotal: dto.total,
    totalItems: dto.totalItems,
    status: dto.orderStatus as OrderStatus,
    paymentStatus: dto.paymentStatus as PaymentStatus,
    shippingStatus: dto.shippingStatus as ShippingStatus,
    paymentMethodId: dto.paymentMethodId,
    paymentMethodName: dto.paymentMethodName,
    paymentTransactionId: dto.paymentTransactionId,
    paymentProofUrl: dto.paymentProofUrl,
    shippingMethodId: dto.shippingMethodId,
    shippingMethodName: dto.shippingMethodName,
    shippingZoneId: dto.shippingZoneId,
    shippingZoneName: dto.shippingZoneName,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapOrderItemDtoToOrderItem(dto: OrderItemDto): OrderItem {
  return {
    id: dto.id,
    orderId: dto.orderId,
    productId: dto.productId,
    productName: dto.productName,
    productSlug: dto.productSlug,
    productImage: dto.productImage,
    unitPrice: dto.unitPrice,
    quantity: dto.quantity,
    subtotal: dto.subtotal,
    selectedSize: dto.selectedSize,
    selectedColor: dto.selectedColor,
    selectedDecorationMethod: dto.selectedDecorationMethod,
    selectedPrintPosition: dto.selectedPrintPosition,
    selectedPrintColors: dto.selectedPrintColors,
    uploadedDesignFiles: dto.uploadedDesignFiles,
    customizationFee: dto.customizationFee,
    productionTime: dto.productionTime,
  };
}
