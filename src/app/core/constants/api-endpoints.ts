// ============ AUTH ENDPOINTS ============
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },

  // ============ PRODUCT ENDPOINTS ============
  PRODUCTS: {
    BASE: '/products',
    GET_ALL: '/products',
    GET_BY_ID: (id: string) => `/products/${id}`,
    GET_FEATURED: '/products/featured',
    GET_BY_CATEGORY: (categoryId: string) => `/products/category/${categoryId}`,
    SEARCH: '/products/search',
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },

  // ============ CATEGORY ENDPOINTS ============
  CATEGORIES: {
    BASE: '/categories',
    GET_ALL: '/categories',
    GET_BY_ID: (id: string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // ============ CART ENDPOINTS ============
  CART: {
    BASE: '/cart',
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
    SYNC: '/cart/sync',
  },

  // ============ ORDER ENDPOINTS ============
  ORDERS: {
    BASE: '/orders',
    GET_ALL: '/orders',
    GET_BY_ID: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },

  // ============ ADDRESS ENDPOINTS ============
  ADDRESSES: {
    BASE: '/addresses',
    GET_ALL: '/addresses',
    GET_BY_ID: (id: string) => `/addresses/${id}`,
    CREATE: '/addresses',
    UPDATE: (id: string) => `/addresses/${id}`,
    DELETE: (id: string) => `/addresses/${id}`,
    SET_DEFAULT: (id: string) => `/addresses/${id}/default`,
  },

  // ============ USER ENDPOINTS ============
  USERS: {
    BASE: '/users',
    GET_ALL: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
  },

  // ============ BANNER ENDPOINTS ============
  BANNERS: {
    BASE: '/banners',
    GET_ALL: '/banners',
    GET_BY_ID: (id: string) => `/banners/${id}`,
    CREATE: '/banners',
    UPDATE: (id: string) => `/banners/${id}`,
    DELETE: (id: string) => `/banners/${id}`,
  },

  // ============ COUPON ENDPOINTS ============
  COUPONS: {
    BASE: '/coupons',
    GET_ALL: '/coupons',
    GET_BY_ID: (id: string) => `/coupons/${id}`,
    APPLY: '/coupons/apply',
    VALIDATE: (code: string) => `/coupons/validate/${code}`,
    CREATE: '/coupons',
    UPDATE: (id: string) => `/coupons/${id}`,
    DELETE: (id: string) => `/coupons/${id}`,
  },

  // ============ REVIEW ENDPOINTS ============
  REVIEWS: {
    BASE: '/reviews',
    GET_ALL: '/reviews',
    GET_BY_PRODUCT: (productId: string) => `/reviews/product/${productId}`,
    CREATE: '/reviews',
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },

  // ============ PAYMENT METHOD ENDPOINTS ============
  PAYMENT_METHODS: {
    BASE: '/payment-methods',
    GET_ALL: '/payment-methods',
    GET_BY_ID: (id: string) => `/payment-methods/${id}`,
    CREATE: '/payment-methods',
    UPDATE: (id: string) => `/payment-methods/${id}`,
    DELETE: (id: string) => `/payment-methods/${id}`,
  },
} as const;