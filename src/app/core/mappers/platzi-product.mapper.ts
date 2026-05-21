import { Product, ProductStatus } from '../models/product.model';
import { PlatziProduct } from '../models/platzi/platzi-product.model';
import { normalizeImageUrl, normalizeImages } from '../helpers/image.helper';

export function mapPlatziProductToProduct(p: PlatziProduct): Product {
  const cleanedImages = normalizeImages(p.images ?? []);
  return {
    id: String(p.id),
    name: p.title,
    slug: p.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    description: p.description,
    price: p.price,
    salePrice: null,
    stockQuantity: 100,
    sku: `PLTZ-${p.id}`,
    thumbnailUrl: normalizeImageUrl(cleanedImages[0]) ?? '',
    images: cleanedImages,
    featured: false,
    enabled: true,
    status: ProductStatus.ACTIVE,
    categoryId: String(p.category?.id ?? 0),
    categoryName: p.category?.name ?? 'Unknown',
    allowReview: true,
    allowCoupon: true,
    allowCart: true,
    allowCheckout: true,
    createdAt: p.creationAt,
    updatedAt: p.updatedAt,
  };
}
