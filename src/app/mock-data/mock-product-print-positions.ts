import { ProductPrintPosition } from '../core/models/customization.model';

export const MOCK_PRODUCT_PRINT_POSITIONS: ProductPrintPosition[] = [
  { id: 'pp-1', productId: '1', name: 'Front Center', code: 'FRONT_CENTER', description: 'Center of the front panel.', extraFee: 0, isActive: true, sortOrder: 1 },
  { id: 'pp-2', productId: '1', name: 'Back Center', code: 'BACK_CENTER', description: 'Center of the back panel.', extraFee: 2, isActive: true, sortOrder: 2 },
  { id: 'pp-3', productId: '1', name: 'Left Chest', code: 'LEFT_CHEST', description: 'Upper left chest area.', extraFee: 0, isActive: true, sortOrder: 3 },
  { id: 'pp-4', productId: '1', name: 'Right Sleeve', code: 'RIGHT_SLEEVE', description: 'Right sleeve area.', extraFee: 1, isActive: true, sortOrder: 4 },
  { id: 'pp-5', productId: '6', name: 'Front Center', code: 'FRONT_CENTER', description: 'Center of the front.', extraFee: 0, isActive: true, sortOrder: 1 },
  { id: 'pp-6', productId: '6', name: 'Back Center', code: 'BACK_CENTER', description: 'Center of the back.', extraFee: 2, isActive: true, sortOrder: 2 },
];
