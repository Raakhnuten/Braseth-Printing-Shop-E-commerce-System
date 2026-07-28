export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  sizeId: string | null;
  colorId: string | null;
  priceAdjustment: number;
  stockQuantity: number;
  isActive: boolean;
  imageUrl: string | null;
}

export interface ProductColor {
  id: string;
  name: string;
  code: string;
  hexCode: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductSize {
  id: string;
  name: string;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface DecorationMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  baseFee: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductDecorationMethod {
  id: string;
  productId: string;
  decorationMethodId: string;
  extraFee: number;
  isActive: boolean;
}

export interface ProductPrintPosition {
  id: string;
  productId: string;
  name: string;
  code: string;
  description: string;
  extraFee: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductPriceBreak {
  id: string;
  productId: string;
  minQuantity: number;
  maxQuantity: number | null;
  unitPrice: number;
  discountPercentage: number;
  isActive: boolean;
}

export interface ProductProductionTime {
  id: string;
  productId: string;
  minDays: number;
  maxDays: number;
  description: string;
  rushAvailable: boolean;
  rushFee: number;
  isActive: boolean;
}

export interface ProductCustomizationFee {
  id: string;
  productId: string;
  feeName: string;
  feeType: 'FIXED' | 'PERCENTAGE' | 'PER_UNIT';
  amount: number;
  isRequired: boolean;
  isActive: boolean;
}

export interface DesignUpload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface PrintColor {
  id: string;
  name: string;
  hexCode: string;
  code: string;
}
