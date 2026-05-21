export interface ProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  sku: string;
  thumbnailUrl: string;
  images: string[];
  featured: boolean;
  enabled: boolean;
  status: string;
  categoryId: string;
  categoryName: string;
  allowReview: boolean;
  allowCoupon: boolean;
  allowCart: boolean;
  allowCheckout: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequestDto {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  sku: string;
  thumbnailUrl: string;
  images: string[];
  featured: boolean;
  enabled: boolean;
  status: string;
  categoryId: string;
  allowReview: boolean;
  allowCoupon: boolean;
  allowCart: boolean;
  allowCheckout: boolean;
}

export type UpdateProductRequestDto = Partial<CreateProductRequestDto>;

export interface ProductListResponseDto {
  content: ProductResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
