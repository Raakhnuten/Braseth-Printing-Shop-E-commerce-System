import { environment } from '../../../environments/environment';

export const APP_CONFIG = {
  APP_NAME: environment.appName,

  // Data source configuration
  API_BASE_URL: environment.apiBaseUrl,
  PLATZI_API_BASE_URL: 'https://api.escuelajs.co/api/v1',

  // Data source flags
  // USE_MOCK_DATA=true  → local mock data
  // USE_FAKE_API=true   → Platzi Fake Store API (when USE_MOCK_DATA=false)
  // both false          → real Spring Boot API at API_BASE_URL
  USE_MOCK_DATA: environment.useMockData,
  USE_FAKE_API: environment.useFakeApi,

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

export const ROUTES = {
  HOME: '',
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'products/:id',
  CATEGORIES: 'categories',
  CART: 'cart',
  CHECKOUT: 'checkout',
  SEARCH: 'search',
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    FORGOT_PASSWORD: 'auth/forgot-password',
    RESET_PASSWORD: 'auth/reset-password',
  },
  USER: {
    DASHBOARD: 'user/dashboard',
    PROFILE: 'user/profile',
    ADDRESSES: 'user/addresses',
    ORDERS: 'user/orders',
    ORDER_DETAIL: 'user/orders/:id',
    WISHLIST: 'user/wishlist',
  },
  ADMIN: {
    DASHBOARD: 'admin/dashboard',
    PRODUCTS: 'admin/products',
    PRODUCT_CREATE: 'admin/products/create',
    PRODUCT_EDIT: 'admin/products/edit/:id',
    CATEGORIES: 'admin/categories',
    ORDERS: 'admin/orders',
    ORDER_DETAIL: 'admin/orders/:id',
    USERS: 'admin/users',
    BANNERS: 'admin/banners',
    COUPONS: 'admin/coupons',
    REVIEWS: 'admin/reviews',
    PAYMENT_METHODS: 'admin/payment-methods',
    SETTINGS: 'admin/settings',
  },
} as const;