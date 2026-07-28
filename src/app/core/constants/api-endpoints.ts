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
    GET_ITEMS: (id: string) => `/orders/${id}/items`,
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

  // ============ PAYMENT METHOD ENDPOINTS ============
  PAYMENT_METHODS: {
    BASE: '/payment-methods',
    GET_ALL: '/payment-methods',
    GET_BY_ID: (id: string) => `/payment-methods/${id}`,
    CREATE: '/payment-methods',
    UPDATE: (id: string) => `/payment-methods/${id}`,
    DELETE: (id: string) => `/payment-methods/${id}`,
  },

  // ============ DECORATION METHOD ENDPOINTS ============
  DECORATION_METHODS: {
    BASE: '/decoration-methods',
    GET_ALL: '/decoration-methods',
    GET_BY_PRODUCT: (productId: string) => `/product-decoration-methods/product/${productId}`,
  },

  // ============ INVOICE ENDPOINTS ============
  INVOICES: {
    BASE: '/invoices',
    GET_ALL: '/invoices',
    GET_BY_ID: (id: string) => `/invoices/${id}`,
    GENERATE: (orderId: string) => `/orders/${orderId}/invoice`,
    MARK_PAID: (id: string) => `/invoices/${id}/pay`,
    DOWNLOAD: (id: string) => `/invoices/${id}/download`,
  },

  // ============ SHIPMENT ENDPOINTS ============
  SHIPMENTS: {
    BASE: '/shipments',
    GET_ALL: '/shipments',
    GET_BY_ID: (id: string) => `/shipments/${id}`,
    CREATE: '/shipments',
    UPDATE_STATUS: (id: string) => `/shipments/${id}/status`,
    UPDATE_TRACKING: (id: string) => `/shipments/${id}/tracking`,
    MARK_DELIVERED: (id: string) => `/shipments/${id}/deliver`,
  },

  // ============ SHIPPING METHOD ENDPOINTS ============
  SHIPPING_METHODS: {
    BASE: '/shipping-methods',
    GET_ALL: '/shipping-methods',
    GET_BY_ID: (id: string) => `/shipping-methods/${id}`,
    CREATE: '/shipping-methods',
    UPDATE: (id: string) => `/shipping-methods/${id}`,
    DELETE: (id: string) => `/shipping-methods/${id}`,
  },

  // ============ SHIPPING ZONE ENDPOINTS ============
  SHIPPING_ZONES: {
    BASE: '/shipping-zones',
    GET_ALL: '/shipping-zones',
    GET_BY_ID: (id: string) => `/shipping-zones/${id}`,
    CREATE: '/shipping-zones',
    UPDATE: (id: string) => `/shipping-zones/${id}`,
    DELETE: (id: string) => `/shipping-zones/${id}`,
  },

  // ============ PRODUCT PRINT POSITION ENDPOINTS ============
  PRODUCT_PRINT_POSITIONS: {
    BASE: '/product-print-positions',
    GET_BY_PRODUCT: (productId: string) => `/product-print-positions/product/${productId}`,
  },

  // ============ PRODUCT PRICE BREAK ENDPOINTS ============
  PRODUCT_PRICE_BREAKS: {
    BASE: '/product-price-breaks',
    GET_BY_PRODUCT: (productId: string) => `/product-price-breaks/product/${productId}`,
  },

  // ============ PRODUCT PRODUCTION TIME ENDPOINTS ============
  PRODUCT_PRODUCTION_TIMES: {
    BASE: '/product-production-times',
    GET_BY_PRODUCT: (productId: string) => `/product-production-times/product/${productId}`,
  },

  // ============ PRODUCT CUSTOMIZATION FEE ENDPOINTS ============
  PRODUCT_CUSTOMIZATION_FEES: {
    BASE: '/product-customization-fees',
    GET_BY_PRODUCT: (productId: string) => `/product-customization-fees/product/${productId}`,
  },

  // ============ PRODUCT PRINT COLOR ENDPOINTS ============
  PRODUCT_PRINT_COLORS: {
    BASE: '/product-print-colors',
    GET_BY_PRODUCT: (productId: string) => `/product-print-colors/product/${productId}`,
  },
} as const;