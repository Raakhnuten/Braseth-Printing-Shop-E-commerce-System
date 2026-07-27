# API Integration Guide — Braseth Printing Shop

## Overview

This is an **Angular 21** frontend for a T-shirt printing shop e-commerce system. It consumes a REST API. This document defines the contract the frontend expects.

**App**: `user-front`
**Base path prefix**: `/api` (configurable per environment)

---

## Environments

| Environment | Base URL | Mock Data |
|---|---|---|
| Development | `http://localhost:8080/api` | Disabled |
| Production | `http://localhost:8080/api` | Disabled |

The `apiBaseUrl` is set in `src/environments/environment.*.ts`. The backend team provides the actual URL.

---

## Authentication

- **Method**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Excluded endpoints** (no token required): `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`
- **Token refresh**: On 401 response, the frontend automatically calls `POST /auth/refresh` and retries the original request. If refresh also fails, the user is logged out.

### Auth Endpoints

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `LoginRequest` | `AuthResponse` |
| POST | `/auth/register` | `RegisterRequest` | `AuthResponse` |
| POST | `/auth/logout` | — | — |
| POST | `/auth/refresh` | — | `AuthResponse` |
| POST | `/auth/forgot-password` | `{ email }` | — |
| POST | `/auth/reset-password` | `{ token, password, confirmPassword }` | — |
| GET | `/auth/me` | — | `AuthUser` |

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  enabled: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
```

---

## Standard Response Envelope

Every endpoint returns:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
  errors?: ApiError[];
}

interface ApiMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiError {
  field: string;
  message: string;
  code: string;
}
```

### Pagination Query Params

List endpoints accept:

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

---

## Complete Endpoint Reference

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List all products (admin) |
| GET | `/products/{id}` | Get single product |
| GET | `/products/featured` | Get featured products |
| GET | `/products/category/{categoryId}` | Get products by category |
| GET | `/products/search` | Search products (`?search=`) |
| POST | `/products` | Create product (admin) |
| PUT | `/products/{id}` | Update product (admin) |
| DELETE | `/products/{id}` | Delete product (admin) |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List all categories |
| GET | `/categories/{id}` | Get single category |
| POST | `/categories` | Create category (admin) |
| PUT | `/categories/{id}` | Update category (admin) |
| DELETE | `/categories/{id}` | Delete category (admin) |

### Cart

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get current user's cart |
| POST | `/cart/add` | Add item to cart |
| PUT | `/cart/update` | Update cart item |
| DELETE | `/cart/remove` | Remove item |
| DELETE | `/cart/clear` | Clear cart |
| POST | `/cart/sync` | Sync cart after login |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders` | List all orders (admin) |
| GET | `/orders/my` | List current user's orders |
| GET | `/orders/{id}` | Get single order |
| POST | `/orders` | Create order |
| PUT | `/orders/{id}/status` | Update order status (admin) |
| PUT | `/orders/{id}/payment-status` | Update payment status (admin) |
| POST | `/orders/{id}/cancel` | Cancel order |
| GET | `/orders/{id}/items` | Get order items |
| GET | `/orders/{id}/track` | Track order shipment |
| POST | `/orders/validate` | Validate order before creation |

### Invoices

| Method | Endpoint | Description |
|---|---|---|
| GET | `/invoices` | List invoices (admin) |
| GET | `/invoices/{id}` | Get single invoice |
| POST | `/orders/{orderId}/invoice` | Generate invoice for order |
| POST | `/invoices/{id}/pay` | Mark invoice as paid (admin) |
| GET | `/invoices/{id}/download` | Get invoice download URL |

### Shipments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/shipments` | List shipments (admin) |
| GET | `/shipments/{id}` | Get single shipment |
| POST | `/shipments` | Create shipment (admin) |
| PATCH | `/shipments/{id}/status` | Update shipment status |
| PATCH | `/shipments/{id}/tracking` | Update tracking number |
| POST | `/shipments/{id}/deliver` | Mark as delivered |

### Shipping Methods

| Method | Endpoint | Description |
|---|---|---|
| GET | `/shipping-methods` | List shipping methods |
| GET | `/shipping-methods/{id}` | Get single method |
| POST | `/shipping-methods` | Create method (admin) |
| PUT | `/shipping-methods/{id}` | Update method (admin) |
| DELETE | `/shipping-methods/{id}` | Delete method (admin) |

### Shipping Zones

| Method | Endpoint | Description |
|---|---|---|
| GET | `/shipping-zones` | List shipping zones |
| GET | `/shipping-zones/{id}` | Get single zone |
| POST | `/shipping-zones` | Create zone (admin) |
| PUT | `/shipping-zones/{id}` | Update zone (admin) |
| DELETE | `/shipping-zones/{id}` | Delete zone (admin) |

### Addresses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/addresses` | List user's addresses |
| GET | `/addresses/{id}` | Get single address |
| POST | `/addresses` | Create address |
| PUT | `/addresses/{id}` | Update address |
| DELETE | `/addresses/{id}` | Delete address |
| PUT | `/addresses/{id}/default` | Set as default address |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List users (admin) |
| GET | `/users/{id}` | Get single user (admin) |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user (admin) |
| GET | `/users/profile` | Get current user's profile |

### Banners

| Method | Endpoint | Description |
|---|---|---|
| GET | `/banners` | List banners |
| GET | `/banners/{id}` | Get single banner |
| POST | `/banners` | Create banner (admin) |
| PUT | `/banners/{id}` | Update banner (admin) |
| DELETE | `/banners/{id}` | Delete banner (admin) |

### Coupons

| Method | Endpoint | Description |
|---|---|---|
| GET | `/coupons` | List coupons (admin) |
| GET | `/coupons/{id}` | Get single coupon |
| POST | `/coupons/apply` | Apply coupon to cart |
| GET | `/coupons/validate/{code}` | Validate coupon code |
| POST | `/coupons` | Create coupon (admin) |
| PUT | `/coupons/{id}` | Update coupon (admin) |
| DELETE | `/coupons/{id}` | Delete coupon (admin) |

### Reviews

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reviews` | List reviews (admin) |
| GET | `/reviews/product/{productId}` | Get reviews for product |
| POST | `/reviews` | Create review |
| PUT | `/reviews/{id}` | Update review |
| DELETE | `/reviews/{id}` | Delete review |

### Payment Methods

| Method | Endpoint | Description |
|---|---|---|
| GET | `/payment-methods` | List payment methods |
| GET | `/payment-methods/{id}` | Get single method |
| POST | `/payment-methods` | Create method (admin) |
| PUT | `/payment-methods/{id}` | Update method (admin) |
| DELETE | `/payment-methods/{id}` | Delete method (admin) |

### Product Variants

| Method | Endpoint | Description |
|---|---|---|
| GET | `/product-variants/product/{productId}` | Get variants for product |
| GET | `/product-variants/colors/{productId}` | Get colors for product |
| GET | `/product-variants/sizes/{productId}` | Get sizes for product |

### Product Customization

| Method | Endpoint | Description |
|---|---|---|
| GET | `/product-feature-controls/product/{productId}` | Get feature controls |
| POST | `/product-feature-controls` | Create feature controls (admin) |
| PUT | `/product-feature-controls/{id}` | Update feature controls (admin) |
| GET | `/product-print-positions/product/{productId}` | Get print positions |
| GET | `/product-price-breaks/product/{productId}` | Get price breaks |
| GET | `/product-production-times/product/{productId}` | Get production time |
| GET | `/product-customization-fees/product/{productId}` | Get customization fees |
| GET | `/product-print-colors/product/{productId}` | Get print colors |

### Decoration Methods

| Method | Endpoint | Description |
|---|---|---|
| GET | `/decoration-methods` | List decoration methods |
| GET | `/product-decoration-methods/product/{productId}` | Get methods for product |

---

## Key Data Models

### Product

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  sku: string;
  thumbnailUrl: string;
  images: string[];
  featured: boolean;
  enabled: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  categoryId: string;
  categoryName: string;
  allowReview: boolean;
  allowCoupon: boolean;
  allowCart: boolean;
  allowCheckout: boolean;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
}
```

### Cart

```typescript
interface Cart {
  items: CartItem[];
  subtotal: number;
  customizationFeeTotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  totalItems: number;
}

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  selectedSize: string | null;
  selectedColor: string | null;
  selectedDecorationMethod: string | null;
  selectedPrintPosition: string | null;
  uploadedDesignFiles: { position: string; fileName: string; fileType: string; fileSize: number }[];
  selectedPrintColors: { colorId: string; colorName: string; colorHex: string }[];
  customizationFee: number;
  productionTime: number | null;
  maxQuantity: number;
  stockQuantity: number;
  salePrice: number | null;
}
```

### Order

```typescript
interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  telegramUsername: string;
  address: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  customizationFeeTotal: number;
  tax: number;
  grandTotal: number;
  totalItems: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingStatus: 'NOT_SHIPPED' | 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'RETURNED' | 'CANCELLED';
  paymentMethodId: string;
  paymentMethodName: string;
  paymentTransactionId: string | null;
  paymentProofUrl: string | null;
  shippingMethodId: string;
  shippingMethodName: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Order Create Request

```typescript
interface OrderCreateRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  telegramUsername: string;
  shippingAddress: string;
  note: string;
  shippingMethodId: string;
  shippingMethodName: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  paymentMethodId: string;
  paymentMethodName: string;
  couponCode: string | null;
  items: {
    productId: string;
    productName: string;
    productSlug: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    selectedSize: string | null;
    selectedColor: string | null;
    selectedDecorationMethod: string | null;
    selectedPrintPosition: string | null;
    uploadedDesignFiles: { position: string; fileName: string; fileType: string; fileSize: number }[];
    selectedPrintColors: { colorId: string; colorName: string; colorHex: string }[];
    customizationFee: number;
    productionTime: number | null;
  }[];
  subtotal: number;
  customizationFeeTotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  totalItems: number;
}
```

> **The backend must recalculate all prices** using its own catalog and pricing rules. Client values are for display only.

### Coupon Validation Result

```typescript
interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | null;
  discountValue: number;
  message: string;
  isExpired?: boolean;
  minOrderNotMet?: boolean;
  usageLimitReached?: boolean;
  productRestriction?: boolean;
  categoryRestriction?: boolean;
}
```

### Invoice

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  billingAddress: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  customizationFeeTotal: number;
  tax: number;
  grandTotal: number;
  currency: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  issuedAt: string | null;
  paidAt: string | null;
  dueAt: string | null;
  downloadUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Shipment

```typescript
interface Shipment {
  id: string;
  orderId: string;
  shipmentNumber: string;
  shippingMethodId: string;
  shippingMethodName: string;
  shippingZoneId: string | null;
  shippingZoneName: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'RETURNED' | 'CANCELLED';
  shippedAt: string | null;
  deliveredAt: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}
```

### Remaining Models

| Model | Key Fields |
|---|---|
| `Address` | `id, userId, firstName, lastName, streetAddress, city, state, zipCode, country, phone, isDefault` |
| `User` | `id, firstName, lastName, email, phone, role: CUSTOMER\|ADMIN, enabled` |
| `Category` | `id, name, slug, imageUrl, enabled, sortOrder, parentId, childIds` |
| `Banner` | `id, title, subtitle, imageUrl, linkUrl, position: HERO\|SIDEBAR\|FOOTER\|PROMO, enabled, sortOrder, startsAt, endsAt` |
| `Coupon` | `id, code, discountType: PERCENTAGE\|FIXED\|FREE_SHIPPING, discountValue, minOrderAmount, maxUses, usedCount, startDate, endDate, enabled` |
| `Review` | `id, productId, userId, userName, rating, title, comment, images, verifiedPurchase, status: PENDING\|APPROVED\|REJECTED` |
| `PaymentMethod` | `id, name, type: CARD\|PAYPAL\|STRIPE\|BANK_TRANSFER\|COD, enabled, sortOrder, config` |
| `ShippingMethod` | `id, name, code, baseFee, isActive, estimatedDeliveryTime, sortOrder` |
| `ShippingZone` | `id, name, code, fee, isActive, sortOrder` |
| `ProductFeatureControl` | `productId, enableSizeSelection, enableColorSelection, enableDesignUpload, isCustomizable, maxUploadFiles, allowedFileTypes, maxFileSizeMb` |
| `ProductVariant` | `productId, sku, sizeId, colorId, priceAdjustment, stockQuantity` |
| `ProductColor` | `name, code, hexCode, isActive, sortOrder` |
| `ProductSize` | `name, code, description, sortOrder` |
| `DecorationMethod` | `name, code, baseFee, isActive` |
| `ProductPrintPosition` | `name, code, extraFee, isActive` |
| `ProductPriceBreak` | `minQuantity, maxQuantity, unitPrice, discountPercentage` |
| `ProductProductionTime` | `minDays, maxDays, rushAvailable, rushFee` |
| `ProductCustomizationFee` | `feeName, feeType: FIXED\|PERCENTAGE\|PER_UNIT, amount, isRequired` |
| `PrintColor` | `name, hexCode, code` |

---

## Important Notes

1. **All IDs are strings** (UUIDs)
2. **All dates are ISO 8601** strings
3. **Prices are decimal numbers** (not cents)
4. **The backend must always recalculate order totals** — never trust client-submitted prices
5. **Wishlist is client-side only** (localStorage) — no backend endpoint needed
6. **Cart is server-side per user** — call `POST /cart/sync` after login to merge local cart
7. **File uploads** should accept multipart uploads and return URLs
8. **All list endpoints** should support pagination (`page`, `pageSize`, `sortBy`, `sortOrder`, `search`)
