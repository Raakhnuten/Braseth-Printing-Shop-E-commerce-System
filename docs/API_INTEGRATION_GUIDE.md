# API Integration Guide

## Overview

This application supports three data source modes controlled by environment configuration:

| Mode | USE_MOCK_DATA | USE_FAKE_API | Data Source |
|------|:---:|:---:|-------------|
| **Mock** (development) | `true` | `false` | Local in-memory mock data |
| **Platzi Fake API** (testing) | `false` | `true` | Platzi Fake Store REST API |
| **Spring Boot** (production) | `false` | `false` | Your Spring Boot backend |

---

## Switching Between Modes

### Development (Mock)

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  useMockData: true,
  useFakeApi: false,
};
```

### Platzi Fake API

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',   // not used when fake API is active
  useMockData: false,
  useFakeApi: true,
};
```

### Production (Spring Boot)

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-domain.com/api',
  useMockData: false,
  useFakeApi: false,
};
```

The production values are in `src/environments/environment.production.ts` and are swapped at build time via `fileReplacements` in `angular.json`.

---

## Endpoint Configuration

All API endpoint paths are defined in `src/app/core/constants/api-endpoints.ts`.

Paths are relative (e.g., `/products`, `/auth/login`). The base URL from the environment config is prepended automatically.

**Example:** `environment.apiBaseUrl = 'http://localhost:8080/api'` + endpoint `/products` → full URL `http://localhost:8080/api/products`

### Key endpoint groups:

| Group | Path prefix | File reference |
|-------|-------------|---------------|
| Auth | `/auth/*` | `API_ENDPOINTS.AUTH` |
| Products | `/products/*` | `API_ENDPOINTS.PRODUCTS` |
| Categories | `/categories/*` | `API_ENDPOINTS.CATEGORIES` |
| Cart | `/cart/*` | `API_ENDPOINTS.CART` |
| Orders | `/orders/*` | `API_ENDPOINTS.ORDERS` |
| Users | `/users/*` | `API_ENDPOINTS.USERS` |
| Addresses | `/addresses/*` | `API_ENDPOINTS.ADDRESSES` |
| Banners | `/banners/*` | `API_ENDPOINTS.BANNERS` |
| Coupons | `/coupons/*` | `API_ENDPOINTS.COUPONS` |
| Reviews | `/reviews/*` | `API_ENDPOINTS.REVIEWS` |
| Payment Methods | `/payment-methods/*` | `API_ENDPOINTS.PAYMENT_METHODS` |

---

## DTOs (Data Transfer Objects)

Located in `src/app/core/models/dto/`.

DTOs define the exact request/response shapes expected from the Spring Boot API. They are separate from the app domain models (`src/app/core/models/`) to allow the API and UI to evolve independently.

| File | Contents |
|------|----------|
| `auth.dto.ts` | Login/Register requests, Auth response |
| `product.dto.ts` | Product CRUD + paginated list response |
| `category.dto.ts` | Category CRUD |
| `cart.dto.ts` | Cart items + add/update requests |
| `order.dto.ts` | Order CRUD + status update |
| `user.dto.ts` | User CRUD + paginated list |
| `address.dto.ts` | Address CRUD |
| `banner.dto.ts` | Banner CRUD |
| `coupon.dto.ts` | Coupon CRUD + apply/validate |
| `review.dto.ts` | Review CRUD |
| `payment-method.dto.ts` | Payment method CRUD |

---

## Mappers

Located in `src/app/core/mappers/spring/`.

Mappers convert between DTOs (API shapes) and app domain models (UI shapes). Each entity has two mapper functions:

- `mapXxxDtoToXxx(dto)` — converts API response DTO → app model
- `mapCreateXxxToDto(model)` — converts create payload → API request DTO

Mappers are pure functions (no class instances) for tree-shakeability.

### Existing Platzi mappers

Located in `src/app/core/mappers/`:

- `platzi-product.mapper.ts`
- `platzi-category.mapper.ts`
- `platzi-auth.mapper.ts`
- `platzi-user.mapper.ts`

These handle Platzi API integration and remain untouched.

---

## ApiService

Located in `src/app/core/services/api.service.ts`.

A centralized HTTP wrapper providing type-safe methods:

```typescript
// GET with optional query params
apiService.get<Product[]>('/products', { categoryId: '1', page: 1 });

// POST with body
apiService.post<Product>('/products', newProductData);

// PUT with body
apiService.put<Product>('/products/123', updatedFields);

// PATCH with body
apiService.patch<Product>('/products/123', partialUpdate);

// DELETE
apiService.delete<void>('/products/123');
```

The `ApiService` automatically:
- Prepends `API_BASE_URL` from the environment config
- Strips empty/undefined query params
- Uses Angular `HttpClient` with interceptor support

---

## Auth Interceptor

Located in `src/app/core/interceptors/auth.interceptor.ts`.

**What it does:**
- Reads JWT token from `localStorage` using `STORAGE_KEYS.AUTH_TOKEN`
- Attaches `Authorization: Bearer <token>` header to all outgoing requests
- On 401 response: logs the user out (future: attempt token refresh first)
- Functional interceptor registered via `withInterceptors([authInterceptor])` in `app.config.ts`

**Registration is active** — the interceptor is enabled for all HTTP requests when the app boots.

---

## How to Update Services for Spring Boot API

Each service uses a three-tier pattern:

```typescript
getProducts(): Observable<ApiResponse<Product[]>> {
  if (APP_CONFIG.USE_MOCK_DATA) {
    return of(this.ok(MOCK_PRODUCTS));
  }
  if (APP_CONFIG.USE_FAKE_API) {
    return this.platziProduct.getProducts().pipe(
      map(res => this.ok(res.data.map(mapPlatziProductToProduct))),
    );
  }
  // REAL API — Spring Boot
  return this.http.get<ApiResponse<Product[]>>(
    `${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.PRODUCTS.GET_ALL}`,
  );
}
```

**To add a new service:**
1. Add endpoint paths to `API_ENDPOINTS` in `api-endpoints.ts`
2. Create DTOs in `src/app/core/models/dto/`
3. Create mapper functions in `src/app/core/mappers/spring/`
4. Follow the three-tier pattern in the service

---

## Example: Product Endpoint Mapping

### Spring Boot Response (expected)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "prod-1",
      "name": "Wireless Headphones",
      "slug": "wireless-headphones",
      "description": "High-quality wireless headphones",
      "price": 249.99,
      "salePrice": 199.99,
      "stockQuantity": 50,
      "sku": "WH-001",
      "thumbnailUrl": "https://example.com/image.jpg",
      "images": ["https://example.com/image1.jpg"],
      "featured": true,
      "enabled": true,
      "status": "ACTIVE",
      "categoryId": "cat-1",
      "categoryName": "Electronics",
      "allowReview": true,
      "allowCoupon": false,
      "allowCart": true,
      "allowCheckout": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 0,
    "pageSize": 12,
    "totalItems": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Mapping flow

```
HTTP Response (JSON)
    ↓
ProductResponseDto (dto/product.dto.ts)
    ↓
mapProductDtoToProduct() (mappers/spring/product.mapper.ts)
    ↓
Product (models/product.model.ts) — used in UI
```

---

## Example: Auth Login Mapping

### Login Request (to Spring Boot)

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Login Response (expected from Spring Boot)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "phone": "+1 555-0100",
      "role": "CUSTOMER",
      "enabled": true,
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
      "expiresIn": 3600
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 3600
  }
}
```

### Mapping flow

```
Login request from form
    ↓
mapLoginRequestToDto() → LoginRequestDto
    ↓
POST /auth/login with LoginRequestDto body
    ↓
HTTP response → AuthResponseDto
    ↓
mapAuthResponseDtoToAuthResponse() → AuthResponse (app model)
    ↓
AuthService stores user + token in localStorage
```

---

## Common Troubleshooting

### CORS Error

**Symptom:** Browser console shows `Access-Control-Allow-Origin` error.

**Fix (Spring Boot):**
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:4200")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### 401 Unauthorized

**Symptoms:** All API calls return 401; interceptor logs out immediately.

**Check:**
1. Is the token stored in `localStorage` under key `seth_store_auth_token`?
2. Is the token expired? (check `expiresIn`)
3. Is the `Authorization` header being sent? (check browser DevTools → Network tab)
4. Does the backend expect `Bearer ` prefix? The interceptor sends `Authorization: Bearer <token>`

**Fix:** Verify login flow completes successfully and stores the token.

### Endpoint 404

**Symptom:** API returns 404 for known endpoints.

**Check:**
1. Does the full URL look correct? (base URL + endpoint path)
2. Does `apiBaseUrl` include `/api`? If so, endpoint paths should NOT start with `/api`
3. Verify the endpoint path in `api-endpoints.ts` matches the Spring Boot `@RequestMapping`

### DTO Mismatch

**Symptom:** API returns data but UI shows nothing or throws errors.

**Check:**
1. Compare the actual API response JSON with the DTO interface
2. Check for missing/renamed fields
3. Check for type mismatches (string vs number vs null)
4. Use browser DevTools → Network → Response to see the raw JSON

**Fix:** Update the DTO interface and/or mapper function.

### Token Not Sent

**Symptom:** Authenticated endpoints return 401 but login works.

**Check:**
1. Is `authInterceptor` registered in `app.config.ts`? (should be: `withInterceptors([authInterceptor])`)
2. Is the token in `localStorage` after login?
3. Does the interceptor run? (set a breakpoint in `auth.interceptor.ts`)

### Refresh Token

The interceptor currently logs out on 401. To implement refresh token logic:

1. Add a refresh token endpoint call in the interceptor
2. Store the new token on success
3. Retry the original request with the new token
4. Only logout if the refresh also fails

See `API_ENDPOINTS.AUTH` for the `/auth/refresh` endpoint path.

---

## Quick Reference

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | Development config |
| `src/environments/environment.production.ts` | Production config |
| `src/app/core/constants/app-config.ts` | Reads environment + adds app constants |
| `src/app/core/constants/api-endpoints.ts` | All REST API endpoint paths |
| `src/app/core/models/dto/*.ts` | Spring Boot DTO interfaces |
| `src/app/core/mappers/spring/*.ts` | DTO ↔ App model converters |
| `src/app/core/services/api.service.ts` | Centralized HTTP wrapper |
| `src/app/core/interceptors/auth.interceptor.ts` | JWT auth header injection |
| `src/app/app.config.ts` | App bootstrap + interceptor registration |
| `src/app/core/services/*.service.ts` | Individual entity services (mock/fake/real pattern) |
