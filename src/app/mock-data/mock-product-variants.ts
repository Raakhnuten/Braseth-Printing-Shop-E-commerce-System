import { ProductVariant } from '../core/models/customization.model';

export const MOCK_PRODUCT_VARIANTS: ProductVariant[] = [
  { id: 'pv-1', productId: '1', sku: 'WBH-001-BLK-S', name: 'Black / Small', sizeId: 'sz-s', colorId: 'pc-black', priceAdjustment: 0, stockQuantity: 20, isActive: true, imageUrl: null },
  { id: 'pv-2', productId: '1', sku: 'WBH-001-BLK-M', name: 'Black / Medium', sizeId: 'sz-m', colorId: 'pc-black', priceAdjustment: 0, stockQuantity: 30, isActive: true, imageUrl: null },
  { id: 'pv-3', productId: '1', sku: 'WBH-001-WHT-M', name: 'White / Medium', sizeId: 'sz-m', colorId: 'pc-white', priceAdjustment: 0, stockQuantity: 25, isActive: true, imageUrl: null },
  { id: 'pv-4', productId: '6', sku: 'OCT-006-GRN-S', name: 'Green / Small', sizeId: 'sz-s', colorId: 'pc-green', priceAdjustment: 0, stockQuantity: 100, isActive: true, imageUrl: null },
  { id: 'pv-5', productId: '6', sku: 'OCT-006-GRN-M', name: 'Green / Medium', sizeId: 'sz-m', colorId: 'pc-green', priceAdjustment: 2, stockQuantity: 150, isActive: true, imageUrl: null },
  { id: 'pv-6', productId: '6', sku: 'OCT-006-BLK-L', name: 'Black / Large', sizeId: 'sz-l', colorId: 'pc-black', priceAdjustment: 2, stockQuantity: 80, isActive: true, imageUrl: null },
];
