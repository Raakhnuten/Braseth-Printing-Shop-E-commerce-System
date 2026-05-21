import { ProductDecorationMethod } from '../core/models/customization.model';

export const MOCK_PRODUCT_DECORATION_METHODS: ProductDecorationMethod[] = [
  { id: 'pdm-1', productId: '1', decorationMethodId: 'dm-1', extraFee: 0, isActive: true },
  { id: 'pdm-2', productId: '1', decorationMethodId: 'dm-2', extraFee: 0, isActive: true },
  { id: 'pdm-3', productId: '1', decorationMethodId: 'dm-3', extraFee: 1, isActive: true },
  { id: 'pdm-4', productId: '1', decorationMethodId: 'dm-4', extraFee: 0, isActive: true },
  { id: 'pdm-5', productId: '1', decorationMethodId: 'dm-5', extraFee: 0, isActive: true },
  { id: 'pdm-6', productId: '6', decorationMethodId: 'dm-1', extraFee: 0, isActive: true },
  { id: 'pdm-7', productId: '6', decorationMethodId: 'dm-2', extraFee: 0, isActive: true },
  { id: 'pdm-8', productId: '6', decorationMethodId: 'dm-4', extraFee: 0, isActive: true },
];
