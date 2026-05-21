import { ProductPriceBreak } from '../core/models/customization.model';

export const MOCK_PRODUCT_PRICE_BREAKS: ProductPriceBreak[] = [
  { id: 'pb-1', productId: '1', minQuantity: 1, maxQuantity: 49, unitPrice: 0, discountPercentage: 0, isActive: true },
  { id: 'pb-2', productId: '1', minQuantity: 50, maxQuantity: 99, unitPrice: 0, discountPercentage: 5, isActive: true },
  { id: 'pb-3', productId: '1', minQuantity: 100, maxQuantity: 249, unitPrice: 0, discountPercentage: 10, isActive: true },
  { id: 'pb-4', productId: '1', minQuantity: 250, maxQuantity: null, unitPrice: 0, discountPercentage: 15, isActive: true },
  { id: 'pb-5', productId: '6', minQuantity: 1, maxQuantity: 23, unitPrice: 0, discountPercentage: 0, isActive: true },
  { id: 'pb-6', productId: '6', minQuantity: 24, maxQuantity: 99, unitPrice: 0, discountPercentage: 5, isActive: true },
  { id: 'pb-7', productId: '6', minQuantity: 100, maxQuantity: 499, unitPrice: 0, discountPercentage: 10, isActive: true },
  { id: 'pb-8', productId: '6', minQuantity: 500, maxQuantity: null, unitPrice: 0, discountPercentage: 15, isActive: true },
];
