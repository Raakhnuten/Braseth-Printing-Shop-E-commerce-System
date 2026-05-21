export interface CartItemSizeQuantity {
  sizeId: string;
  sizeName: string;
  quantity: number;
}

export interface CartItemDesignUpload {
  position: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface CartItemPrintColor {
  colorId: string;
  colorName: string;
  colorHex: string;
}

/** @deprecated Use CartItemDesignUpload and CartItemPrintColor directly */
export interface CartCustomization {
  selectedColors: string[];
  multipleColors: boolean;
  decorationMethod: string;
  frontDesignFileName: string;
  backDesignFileName: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
}

export interface CartItem {
  id: string;
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
  uploadedDesignFiles: CartItemDesignUpload[];
  selectedPrintColors: CartItemPrintColor[];
  customizationFee: number;
  productionTime: number | null;
  maxQuantity: number;
  stockQuantity: number;
  salePrice: number | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  customizationFeeTotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  totalItems: number;
}
