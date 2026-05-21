import { ProductProductionTime } from '../core/models/customization.model';

export const MOCK_PRODUCT_PRODUCTION_TIMES: ProductProductionTime[] = [
  { id: 'pt-1', productId: '1', minDays: 5, maxDays: 7, description: 'Standard production time for customized orders.', rushAvailable: true, rushFee: 10, isActive: true },
  { id: 'pt-2', productId: '6', minDays: 3, maxDays: 5, description: 'Standard production time for apparel customization.', rushAvailable: true, rushFee: 8, isActive: true },
];
