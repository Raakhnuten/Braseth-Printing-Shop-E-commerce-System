import { ProductSize } from '../core/models/customization.model';

export const MOCK_PRODUCT_SIZES: ProductSize[] = [
  { id: 'sz-xs', name: 'XS', code: 'XS', description: 'Extra Small', sortOrder: 1, isActive: true },
  { id: 'sz-s', name: 'S', code: 'S', description: 'Small', sortOrder: 2, isActive: true },
  { id: 'sz-m', name: 'M', code: 'M', description: 'Medium', sortOrder: 3, isActive: true },
  { id: 'sz-l', name: 'L', code: 'L', description: 'Large', sortOrder: 4, isActive: true },
  { id: 'sz-xl', name: 'XL', code: 'XL', description: 'Extra Large', sortOrder: 5, isActive: true },
  { id: 'sz-2xl', name: '2XL', code: '2XL', description: 'Double Extra Large', sortOrder: 6, isActive: true },
];
