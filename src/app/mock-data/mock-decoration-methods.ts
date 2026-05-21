import { DecorationMethod } from '../core/models/customization.model';

export const MOCK_DECORATION_METHODS: DecorationMethod[] = [
  { id: 'dm-1', name: 'Embroidery', code: 'EMBROIDERY', description: 'Elegant needle-stitched logo on fabric. Premium quality finish.', baseFee: 5, isActive: true, sortOrder: 1 },
  { id: 'dm-2', name: 'Screen Printing', code: 'SCREEN_PRINTING', description: 'Mesh screen transfer for bold, vibrant designs.', baseFee: 3, isActive: true, sortOrder: 2 },
  { id: 'dm-3', name: 'Digital Printing', code: 'DIGITAL_PRINTING', description: 'Direct inkjet application for detailed, full-color designs.', baseFee: 4, isActive: true, sortOrder: 3 },
  { id: 'dm-4', name: 'Heat Transfer', code: 'HEAT_TRANSFER', description: 'Heat-pressed design from transfer paper. Great for small runs.', baseFee: 2, isActive: true, sortOrder: 4 },
  { id: 'dm-5', name: 'No Decoration', code: 'NONE', description: 'Product will be blank. No customization applied.', baseFee: 0, isActive: true, sortOrder: 5 },
];
