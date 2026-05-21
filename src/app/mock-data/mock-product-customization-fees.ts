import { ProductCustomizationFee } from '../core/models/customization.model';

export const MOCK_PRODUCT_CUSTOMIZATION_FEES: ProductCustomizationFee[] = [
  { id: 'cf-1', productId: '1', feeName: 'Multi-color surcharge', feeType: 'FIXED', amount: 2, isRequired: false, isActive: true },
  { id: 'cf-2', productId: '6', feeName: 'Multi-color surcharge', feeType: 'FIXED', amount: 2, isRequired: false, isActive: true },
  { id: 'cf-3', productId: '6', feeName: 'Large size fee', feeType: 'FIXED', amount: 1, isRequired: false, isActive: true },
];
