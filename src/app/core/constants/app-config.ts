import { environment } from '../../../environments/environment';

export const APP_CONFIG = {
  APP_NAME: environment.appName,

  // Data source configuration
  API_BASE_URL: environment.apiBaseUrl,

  // Data source flags
  // USE_MOCK_DATA=true  → local mock data
  // USE_MOCK_DATA=false → real Spring Boot API at API_BASE_URL
  USE_MOCK_DATA: environment.useMockData,

  DEFAULT_PAGE_SIZE: environment.defaultPageSize,
  STORAGE_KEYS: {
    CART: 'seth_store_cart',
    AUTH_TOKEN: 'seth_store_auth_token',
    REFRESH_TOKEN: 'seth_store_refresh_token',
    USER: 'seth_store_user',
    WISHLIST: 'seth_store_wishlist',
  },
  COOKIE_EXPIRY: 7,
  PASSWORD_MIN_LENGTH: 8,
  IMAGE_MAX_SIZE_MB: 5,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};


