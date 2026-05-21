import { ProductColor } from '../core/models/customization.model';

export const MOCK_PRODUCT_COLORS: ProductColor[] = [
  { id: 'pc-black', name: 'Black', code: 'BLK', hexCode: '#222222', isActive: true, sortOrder: 1 },
  { id: 'pc-white', name: 'White', code: 'WHT', hexCode: '#FFFFFF', isActive: true, sortOrder: 2 },
  { id: 'pc-navy', name: 'Navy', code: 'NVY', hexCode: '#1B2A4A', isActive: true, sortOrder: 3 },
  { id: 'pc-red', name: 'Red', code: 'RED', hexCode: '#DC2626', isActive: true, sortOrder: 4 },
  { id: 'pc-green', name: 'Green', code: 'GRN', hexCode: '#16A34A', isActive: true, sortOrder: 5 },
  { id: 'pc-blue', name: 'Blue', code: 'BLU', hexCode: '#2563EB', isActive: true, sortOrder: 6 },
  { id: 'pc-gray', name: 'Gray', code: 'GRY', hexCode: '#6B7280', isActive: true, sortOrder: 7 },
];
