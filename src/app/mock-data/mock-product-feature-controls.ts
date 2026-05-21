import { ProductFeatureControl } from '../core/models/customization.model';

export const MOCK_PRODUCT_FEATURE_CONTROLS: ProductFeatureControl[] = [
  {
    id: 'fc-1', productId: '1',
    enableSizeSelection: false, enableColorSelection: true, enableDesignUpload: true,
    enableDecorationMethod: true, enablePrintPosition: true, enablePrintColor: true,
    enablePriceBreak: true, enableProductionTime: true, enableCustomizationFee: true,
    isCustomizable: true, maxUploadFiles: 2, allowedFileTypes: ['image/png', 'image/jpeg', 'image/svg', 'application/pdf'], maxFileSizeMb: 10,
  },
  {
    id: 'fc-6', productId: '6',
    enableSizeSelection: true, enableColorSelection: true, enableDesignUpload: true,
    enableDecorationMethod: true, enablePrintPosition: true, enablePrintColor: false,
    enablePriceBreak: true, enableProductionTime: true, enableCustomizationFee: true,
    isCustomizable: true, maxUploadFiles: 2, allowedFileTypes: ['image/png', 'image/jpeg', 'image/svg'], maxFileSizeMb: 5,
  },
  {
    id: 'fc-default', productId: 'default',
    enableSizeSelection: false, enableColorSelection: false, enableDesignUpload: false,
    enableDecorationMethod: false, enablePrintPosition: false, enablePrintColor: false,
    enablePriceBreak: false, enableProductionTime: false, enableCustomizationFee: false,
    isCustomizable: false, maxUploadFiles: 1, allowedFileTypes: ['image/png', 'image/jpeg'], maxFileSizeMb: 5,
  },
];
