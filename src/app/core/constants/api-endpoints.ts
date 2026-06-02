export const API_ENDPOINTS = {
  // ============ AUTH ENDPOINTS ============
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
  },

  // ============ SECURITY ENDPOINTS ============
  // TODO: When migrating to cookie-based auth, the backend must:
  //   1. Set a readable XSRF-TOKEN cookie on the first GET request
  //   2. Validate the X-XSRF-TOKEN header on every mutating request
  //   3. Use Secure, HttpOnly, SameSite=Strict cookies for the session token
  // Frontend should send X-XSRF-TOKEN header matching the XSRF-TOKEN cookie value.
  // This is only needed for cookie-based auth; Bearer token auth has built-in CSRF
  // protection since tokens are not automatically sent by the browser.
  SECURITY: {
    CSRF_TOKEN: '/security/csrf-token',
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
    GET_MY: '/orders/my',
    GET_BY_ID: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id: string) => `/orders/${id}/payment-status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACK: (id: string) => `/orders/${id}/track`,
    VALIDATE_BEFORE_CREATE: '/orders/validate',
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

  // ============ PRODUCT VARIANT ENDPOINTS ============
  PRODUCT_VARIANTS: {
    BASE: '/product-variants',
    GET_BY_PRODUCT: (productId: string) => `/product-variants/product/${productId}`,
    COLORS_BY_PRODUCT: (productId: string) => `/product-variants/colors/${productId}`,
    SIZES_BY_PRODUCT: (productId: string) => `/product-variants/sizes/${productId}`,
  },

  // ============ FEATURE CONTROL ENDPOINTS ============
  FEATURE_CONTROLS: {
    BASE: '/product-feature-controls',
    GET_BY_PRODUCT: (productId: string) => `/product-feature-controls/product/${productId}`,
    CREATE: '/product-feature-controls',
    UPDATE: (id: string) => `/product-feature-controls/${id}`,
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