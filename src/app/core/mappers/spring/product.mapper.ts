import { Product, ProductStatus } from '../../models/product.model';
import { ProductResponseDto, CreateProductRequestDto } from '../../models/dto/product.dto';

export function mapProductDtoToProduct(dto: ProductResponseDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    price: dto.price,
    salePrice: dto.salePrice,
    stockQuantity: dto.stockQuantity,
    sku: dto.sku,
    thumbnailUrl: dto.thumbnailUrl,
    images: dto.images,
    featured: dto.featured,
    enabled: dto.enabled,
    status: dto.status as ProductStatus,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    allowReview: dto.allowReview,
    allowCoupon: dto.allowCoupon,
    allowCart: dto.allowCart,
    allowCheckout: dto.allowCheckout,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapCreateProductToDto(product: Partial<Product>): CreateProductRequestDto {
  return {
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    price: product.price || 0,
    salePrice: product.salePrice ?? null,
    stockQuantity: product.stockQuantity || 0,
    sku: product.sku || '',
    thumbnailUrl: product.thumbnailUrl || '',
    images: product.images || [],
    featured: product.featured || false,
    enabled: product.enabled ?? true,
    status: product.status || ProductStatus.DRAFT,
    categoryId: product.categoryId || '',
    allowReview: product.allowReview ?? true,
    allowCoupon: product.allowCoupon ?? true,
    allowCart: product.allowCart ?? true,
    allowCheckout: product.allowCheckout ?? true,
  };
}
