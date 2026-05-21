export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  customizationFeeTotal: number;
  tax: number;
  grandTotal: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string | null;
  paidAt: string | null;
  dueAt: string | null;
  downloadUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
