export interface CartItemDto {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  quantity: number;
  thumbnailUrl: string;
  stockQuantity: number;
  maxQuantity: number;
}

export interface CartResponseDto {
  items: CartItemDto[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

export interface AddToCartRequestDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequestDto {
  productId: string;
  quantity: number;
}
