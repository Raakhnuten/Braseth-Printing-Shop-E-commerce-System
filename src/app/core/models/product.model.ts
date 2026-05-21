export interface Product {
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
  status: ProductStatus;
  categoryId: string;
  categoryName: string;
  allowReview: boolean;
  allowCoupon: boolean;
  allowCart: boolean;
  allowCheckout: boolean;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}