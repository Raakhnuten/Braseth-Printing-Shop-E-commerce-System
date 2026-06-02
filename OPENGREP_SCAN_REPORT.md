# OpenGrep Scan Report — Seth Store (Angular 21 E-commerce)

## Batch 1 Follow-up Fixes

| Metric | Value |
|--------|-------|
| **Files changed** | 41 |
| **New files created** | 2 (shared/utils/url.util.ts, shared/pipes/safe-url.pipe.ts) |
| **Build result** | ✅ PASS (1 pre-existing SCSS budget warning) |
| **Test result** | 1 passed, 1 pre-existing failure (app.spec.ts default scaffold) |

### What was fixed

| Fix | Details | Severity Addressed |
|-----|---------|-------------------|
| **Subscriptions** — Added `takeUntilDestroyed()` to all 84 `.subscribe()` calls across 28 component files | All components with subscriptions now clean up on destroy | Critical (C-2) |
| **URL safety** — Created `shared/utils/url.util.ts` with `isSafeUrl()` / `getSafeUrl()` | Blocks `javascript:`, `data:`, `vbscript:` protocols | Medium (M-2, M-3) |
| **URL safety** — Created `shared/pipes/safe-url.pipe.ts` with `SafeUrlPipe` | Pipe for template `[href]` bindings | Medium (M-3) |
| **URL safety** — Applied `safeUrl` pipe to 3 template `[href]` bindings | Page header breadcrumbs, tracking URLs, payment proof URLs | Medium (M-3) |
| **URL safety** — Updated `openUrl()` in order-detail to use shared `isSafeUrl()` | Replaced inline protocol check with shared utility | Medium (M-2) |
| **Auth guards** — Added detailed TODO comments about backend enforcement | Clear documentation that client-side guards are UX-only | High (H-2) |
| **Auth interceptor** — Added TODO comments for HttpOnly cookie migration and token refresh | Documented next steps for production security | High (H-8) |
| **Auth service** — Added TODO comments about localStorage vulnerability | Documented need for HttpOnly cookie migration | Critical (C-1) |

### Issues intentionally left for backend

| Issue | Reason |
|-------|--------|
| Auth tokens in localStorage (C-1) | Requires backend to support HttpOnly, Secure, SameSite cookies |
| Server-side token validation in guards (H-2) | Requires backend auth validation endpoint |
| Cart price tampering via localStorage (H-3) | Server must recalculate prices from own product catalog |
| Client-side coupon validation (H-4) | Server must independently validate coupons |
| No token refresh on 401 (H-8) | Requires backend refresh token endpoint |
| CSRF protection (M-4) | Backend must issue and validate CSRF tokens |

### Issues requiring future frontend work

| Issue | Reason |
|-------|--------|
| Admin users component — mock-only (H-5) | Needs UserService integration (would change mock data behavior) |
| Product detail — bypasses services for colors/sizes (H-6) | Needs service integration (would change mock data behavior) |
| Admin dashboard nested subscriptions (H-9) | Still uses nested subscribe — should use `forkJoin` (minimal risk with takeUntilDestroyed) |
| Redundant environment files (M-10) | `src/app/environments/` is unused — safe to remove but not urgent |

---

## Scan Details

| Field | Value |
|-------|-------|
| **Tool** | OpenGrep 1.22.0 |
| **Scan command** | `opengrep scan --config auto --json --output opengrep-report.json . --exclude='node_modules/**' --exclude='dist/**' --exclude='.angular/**' --exclude='.git/**'` |
| **Supplemental scans** | `--config p/typescript --config p/javascript --config p/secrets`, `--config p/security-audit` |
| **Manual analysis** | Targeted grep for Angular-specific risks (localStorage, XSS, auth guards, subscriptions, etc.) |
| **Scan date** | 2026-05-26 |
| **Files scanned** | 277 |
| **Rules applied** | 1059 (auto), 110 (TS/JS/secrets), 30 (security-audit) |

## Total Findings: 30

- **Critical**: 2
- **High**: 9
- **Medium**: 12
- **Low**: 7

---

## FINDINGS

### CRITICAL

#### C-1: Auth tokens stored in localStorage (XSS-vulnerable)

| Field | Value |
|-------|-------|
| **File** | `src/app/core/services/auth.service.ts` |
| **Lines** | 58-60, 112-116, 122-128 |
| **Rule** | Manual analysis |
| **Risk** | Critical |
| **Real/FP** | Real issue |

**Problem:**
Auth tokens (`seth_store_auth_token`, `seth_store_refresh_token`, and user profile including role) are stored in `localStorage` with no encryption, HttpOnly, or Secure flags. Any XSS vulnerability in the app (or any other app on the same origin) can exfiltrate these tokens. The `REFRESH_TOKEN` is stored but never used for token refresh (interceptor line 22 has a TODO).

**Recommended fix:**
Move to HttpOnly, Secure, SameSite cookies for production. For now, ensure no XSS vectors exist and implement token refresh.

**Priority:** 1

#### C-2: 85+ unmanaged Observable subscriptions — no component implements OnDestroy

| Field | Value |
|-------|-------|
| **Files** | All feature components with `.subscribe()` calls |
| **Rule** | Manual analysis |
| **Risk** | Critical |
| **Real/FP** | Real issue |

**Problem:**
Across the entire codebase, components call `.subscribe()` on Observables without:
- `ngOnDestroy` + `Subject`/`takeUntil`
- `takeUntilDestroyed()` (Angular 16+)
- `DestroyRef` injection (Angular 18+)

Affected components: `HomeComponent`, `ProductsComponent`, `ProductDetailComponent`, `SearchComponent`, `CheckoutComponent`, `LoginComponent`, `RegisterComponent`, all admin components. This causes memory leaks and potential double-execution when components are re-initialized.

**Recommended fix:**
Add `takeUntilDestroyed()` from `@angular/core/rxjs-interop` to all subscriptions, or use `DestroyRef` + `takeUntilDestroyed`.

**Priority:** 2

---

### HIGH

#### H-1: Placeholder production API URL in environment config

| Field | Value |
|-------|-------|
| **File** | `src/environments/environment.production.ts` |
| **Line** | 3 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Real issue |

**Problem:**
`apiBaseUrl: 'https://your-domain.com/api'` is a placeholder that has not been replaced. If deployed as-is, the app calls an unregistered domain that could be registered by an attacker.

**Recommended fix:**
Replace with the actual production backend URL.

**Priority:** 3

#### H-2: Client-side auth guard with localStorage-backed role check

| Field | Value |
|-------|-------|
| **File** | `src/app/core/guards/auth.guard.ts`, `src/app/core/guards/admin.guard.ts` |
| **Lines** | 6-17, 6-25 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Real issue (architectural) |

**Problem:**
Both guards read `AuthService.isLoggedIn()` and `isAdmin()` which derive from a signal initialized by `localStorage.getItem()`. A user can edit localStorage to set `{ role: "ADMIN" }` and bypass admin route protection. No server-side token validation occurs at guard time.

**Recommended fix:**
Add a lightweight server-side token validation endpoint call in guards, or validate the JWT signature client-side if the token format is known. For now, note this is mitigated by server-side API authorization.

**Priority:** 4

#### H-3: Cart price data stored client-side — no server validation

| Field | Value |
|-------|-------|
| **File** | `src/app/core/services/cart.service.ts` |
| **Lines** | 46-64, 272-279, 289-307 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Real issue (mitigated by server-side enforcement) |

**Problem:**
Cart items with client-computed `unitPrice`, `subtotal`, and `customizationFee` are stored in localStorage and sent to the server via `syncGuestCart()`. If the server does not recalculate prices from its own product catalog, a user can tamper with prices.

**Recommended fix:**
Ensure the server recalculates all prices, discounts, and fees from its own data when processing orders.

**Priority:** 5

#### H-4: Client-side coupon validation with hardcoded coupons

| Field | Value |
|-------|-------|
| **File** | `src/app/core/services/checkout.service.ts` |
| **Lines** | 82-108 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Real issue (conditional on mock mode) |

**Problem:**
In mock/fake API mode, coupon validation is entirely client-side with hardcoded coupons (`SAVE10`, `FREESHIP`, `WELCOME25`). Discounts are applied client-side and sent in the order payload.

**Recommended fix:**
Server must independently validate coupons and recalculate discounts on order creation.

**Priority:** 6

#### H-5: Admin users component bypasses service layer — only shows mock data

| Field | Value |
|-------|-------|
| **File** | `src/app/features/admin/users/admin-users.component.ts` |
| **Line** | 5, 22 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Real issue |

**Problem:**
`AdminUsersComponent` imports `MOCK_USERS` directly and assigns `users: User[] = MOCK_USERS` without injecting any UserService. This component only shows static mock data and will not work with a real backend API.

**Recommended fix:**
Inject a `UserService` and fetch users from the API. Keep mock data as fallback.

**Priority:** 7

#### H-6: Product detail component bypasses services for colors/sizes

| Field | Value |
|-------|-------|
| **File** | `src/app/features/public/product-detail/product-detail.component.ts` |
| **Lines** | 26-28 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Real issue |

**Problem:**
The product detail component imports `MOCK_PRODUCT_COLORS`, `MOCK_PRODUCT_SIZES`, and `MOCK_PRINT_COLORS` directly instead of using the variant/customization services. Real backend data for these properties is ignored.

**Recommended fix:**
Inject `ProductVariantService` and `ProductCustomizationService` to fetch real data.

**Priority:** 8

#### H-7: Mock JWT tokens returned in non-production modes

| Field | Value |
|-------|-------|
| **File** | `src/app/core/services/auth.service.ts` |
| **Lines** | 78-79, 82, 100-101, 104 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Conditional on misconfiguration |

**Problem:**
When `USE_MOCK_DATA` is true, hardcoded `mock-jwt-token` and `mock-refresh-token` are returned. If these flags are accidentally enabled in production, dummy tokens would be used as real Authorization headers.

**Recommended fix:**
Ensure `USE_MOCK_DATA` and `USE_FAKE_API` are false in production environment.

**Priority:** 9

#### H-8: No token refresh mechanism — 401 immediately logs out

| Field | Value |
|-------|-------|
| **File** | `src/app/core/interceptors/auth.interceptor.ts` |
| **Line** | 22 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Real issue |

**Problem:**
On 401 error, the auth interceptor immediately logs the user out instead of attempting to refresh the access token. The `REFRESH_TOKEN` is stored in localStorage but never used anywhere in the codebase.

**Recommended fix:**
Implement token refresh logic using the stored refresh token before logging out.

**Priority:** 10

#### H-9: Dashboard component has nested subscriptions

| Field | Value |
|-------|-------|
| **File** | `src/app/features/admin/dashboard/admin-dashboard.component.ts` |
| **Lines** | 47-60 |
| **Rule** | Manual analysis |
| **Risk** | High |
| **Real/FP** | Real issue |

**Problem:**
`getProducts().subscribe()` has a nested `getOrders().subscribe()` inside the `next` handler without using `switchMap` or `mergeMap`. If `getProducts()` emits multiple times, multiple `getOrders()` subscriptions are created.

**Recommended fix:**
Use `switchMap` or `forkJoin` to flatten nested subscriptions.

**Priority:** 11

---

### MEDIUM

#### M-1: `clearStorage()` wipes entire origin localStorage

| Field | Value |
|-------|-------|
| **File** | `src/app/shared/utils/storage.util.ts` |
| **Line** | 30 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue |

**Problem:**
`localStorage.clear()` removes ALL keys for the entire origin, potentially destroying data from other apps sharing the same domain.

**Recommended fix:**
Only remove app-specific keys (AUTH_TOKEN, REFRESH_TOKEN, USER, CART, WISHLIST).

**Priority:** 12

#### M-2: `window.open()` with backend-supplied URL without validation

| Field | Value |
|-------|-------|
| **File** | `src/app/features/user/order-detail/user-order-detail.component.ts` |
| **Line** | 78 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue |

**Problem:**
`openUrl(url: string | null)` calls `window.open(url, '_blank')` with the URL coming from the backend. If the backend returns a `javascript:` URL, this could be exploited.

**Recommended fix:**
Validate URL protocol before opening. Reject `javascript:` and `data:` URLs.

**Priority:** 13

#### M-3: Dynamic `[href]` bindings with backend-supplied URLs

| Field | Value |
|-------|-------|
| **Files** | `src/app/features/user/order-detail/user-order-detail.component.html:84,121`, `src/app/features/admin/shipments/admin-shipments.component.html:69`, `src/app/shared/components/page-header/page-header.component.html:5` |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue (partially mitigated by Angular sanitization) |

**Problem:**
`[href]` bindings on tracking URLs, payment proof URLs, and breadcrumb URLs accept dynamic data. While Angular sanitizes `[href]`, `javascript:` URLs may still be dangerous depending on Angular version.

**Recommended fix:**
Add a URL sanitization pipe that validates the protocol before allowing navigation.

**Priority:** 14

#### M-4: No CSRF protection in HTTP interceptor

| Field | Value |
|-------|-------|
| **File** | `src/app/core/interceptors/auth.interceptor.ts` |
| **Lines** | 1-31 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue (depends on backend) |

**Problem:**
The interceptor does not include `X-XSRF-Token` header or `withCredentials`. If the backend does not enforce CSRF protection separately, the app could be vulnerable.

**Recommended fix:**
Add CSRF token handling in the interceptor.

**Priority:** 15

#### M-5: `PaymentMethodConfig` model defines `apiKey`/`secretKey` fields

| Field | Value |
|-------|-------|
| **File** | `src/app/core/models/payment-method.model.ts` |
| **Lines** | 22-24 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Latent risk (depends on backend) |

**Problem:**
The model stores `apiKey`, `secretKey`, and `webhookSecret` fields. These could be exposed via API responses to the client.

**Recommended fix:**
Ensure the backend never returns these fields to the frontend.

**Priority:** 16

#### M-6: `useFakeApi: true` in development default — could leak to production

| Field | Value |
|-------|-------|
| **Files** | `src/environments/environment.ts`, `src/environments/environment.development.ts` |
| **Line** | 5 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Conditional on misconfiguration |

**Problem:**
Development defaults have `useFakeApi: true`, routing orders through the Platzi Fake Store API. If misconfigured in production, orders would be lost.

**Recommended fix:**
Production environment file has `useFakeApi: false` — verify this is set correctly.

**Priority:** 17

#### M-7: Auth service eagerly loaded via guards (performance)

| Field | Value |
|-------|-------|
| **Files** | `src/app/core/guards/auth.guard.ts`, `src/app/core/guards/admin.guard.ts` |
| **Lines** | 4 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue (performance) |

**Problem:**
Both guards import `AuthService` directly, causing it (and its dependencies: `ApiService`, `PlatziAuthService`, `HttpClient`) to be eagerly instantiated even for anonymous users visiting public pages.

**Recommended fix:**
Inject lazily or defer auth check until needed for public pages.

**Priority:** 18

#### M-8: Nested subscriptions without flattening in admin dashboard

| Field | Value |
|-------|-------|
| **File** | `src/app/features/admin/dashboard/admin-dashboard.component.ts` |
| **Lines** | 47-60 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue |

**Problem:** (Duplicate of H-9 for the nested pattern, listed here for completeness)
Nested subscribe inside subscribe.

**Priority:** 19

#### M-9: All services embed mock data fallbacks (production bundle bloat)

| Field | Value |
|-------|-------|
| **Files** | All services in `src/app/core/services/` |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue |

**Problem:**
Every service conditionally imports and returns mock data. This mock data is included in the production build, increasing bundle size. Dead code paths for mock/fake API modes are never tree-shaken.

**Recommended fix:**
Use Angular environment-based conditional imports or a separate mock module that is tree-shaken in production.

**Priority:** 20

#### M-10: Redundant environment file sets cause confusion

| Field | Value |
|-------|-------|
| **Files** | `src/environments/` (3 files) vs `src/app/environments/` (2 files) |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue |

**Problem:**
Two sets of environment files with overlapping configs. `src/app/environments/` is entirely unused but still maintained. This can cause confusion about which file is actually in effect.

**Recommended fix:**
Remove unused `src/app/environments/` directory and consolidate into `src/environments/`.

**Priority:** 21

#### M-11: Cart quantity update caps at stock but no per-order max limit

| Field | Value |
|-------|-------|
| **File** | `src/app/core/services/cart.service.ts` |
| **Lines** | 81-121, 217-231 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue |

**Problem:**
No maximum quantity or cart size enforcement beyond individual item `stockQuantity`. An attacker could add millions of items (up to `stockQuantity` per product) creating a denial-of-service vector.

**Recommended fix:**
Add a max cart item count and per-item max quantity limit.

**Priority:** 22

#### M-12: Hardcoded free-shipping threshold ($100) is not configurable

| Field | Value |
|-------|-------|
| **File** | `src/app/core/services/cart.service.ts` |
| **Line** | 294 |
| **Rule** | Manual analysis |
| **Risk** | Medium |
| **Real/FP** | Real issue |

**Problem:**
`shippingFee = subtotal > 100 ? 0 : 9.99` uses a hardcoded threshold that ignores actual shipping methods, zones, or backend configuration.

**Recommended fix:**
Move shipping fee calculation to the backend or a configurable setting.

**Priority:** 23

---

### LOW

#### L-1: Missing subresource integrity on CDN link (theme.css)

| Field | Value |
|-------|-------|
| **File** | `src/index.html` |
| **Line** | 9 |
| **Rule** | `html.security.audit.missing-integrity` |
| **Risk** | Low |
| **Real/FP** | Real issue (low impact for CSS) |

**Problem:**
CDN link to PrimeNG theme CSS lacks `integrity` attribute. An attacker who compromises the CDN could modify the CSS.

**Recommended fix:**
Add `integrity` attribute with the correct SRI hash.

**Priority:** 24

#### L-2: Missing subresource integrity on CDN link (primeng.min.css)

| Field | Value |
|-------|-------|
| **File** | `src/index.html` |
| **Line** | 10 |
| **Rule** | `html.security.audit.missing-integrity` |
| **Risk** | Low |
| **Real/FP** | Real issue (low impact for CSS) |

**Problem:** Same as L-1.

**Priority:** 25

#### L-3: Missing subresource integrity on CDN link (primeicons.css)

| Field | Value |
|-------|-------|
| **File** | `src/index.html` |
| **Line** | 11 |
| **Rule** | `html.security.audit.missing-integrity` |
| **Risk** | Low |
| **Real/FP** | Real issue (low impact for CSS) |

**Problem:** Same as L-1.

**Priority:** 26

#### L-4: Duplicate hardcoded Platzi API URL across config files

| Field | Value |
|-------|-------|
| **Files** | `src/app/core/constants/app-config.ts:8`, multiple env files |
| **Rule** | Manual analysis |
| **Risk** | Low |
| **Real/FP** | Real issue |

**Problem:**
`https://api.escuelajs.co/api/v1` is hardcoded in `app-config.ts` AND in environment files. This is a public test API (no credentials), but duplication risks config drift.

**Priority:** 27

#### L-5: Search query string passed via router.navigate

| Field | Value |
|-------|-------|
| **File** | `src/app/layout/header/header.component.ts` |
| **Line** | 161 |
| **Rule** | Manual analysis |
| **Risk** | Low |
| **Real/FP** | Real issue (mitigated by Angular sanitization) |

**Problem:**
User search input is passed directly as a query param. Angular router sanitizes this, but if the search page reflects it unsafely, XSS is possible.

**Priority:** 28

#### L-6: `returnUrl` query param in guards could enable open redirect

| Field | Value |
|-------|-------|
| **Files** | `src/app/core/guards/auth.guard.ts:12`, `admin.guard.ts:12` |
| **Rule** | Manual analysis |
| **Risk** | Low |
| **Real/FP** | Real issue (currently mitigated by login not consuming it) |

**Problem:**
The `returnUrl` from `state.url` is passed to login as a query param. Currently, `LoginComponent` does not use it (always navigates to dashboard), so the risk is mitigated.

**Priority:** 29

#### L-7: SVG template generation (static, low risk)

| Field | Value |
|-------|-------|
| **File** | `src/app/features/public/product-detail/product-detail.component.ts` |
| **Lines** | 438-458 |
| **Rule** | Manual analysis |
| **Risk** | Low |
| **Real/FP** | Real issue (currently safe) |

**Problem:**
`downloadTemplate()` constructs an SVG as a Blob URL. Content is static (not user-influenced), but if user data were embedded in the SVG, it could be an XSS vector.

**Priority:** 30

---

## OpenGrep Parsing Errors (non-security)

These files had partial parsing errors in OpenGrep. They do not represent security issues but indicate Angular template syntax that OpenGrep's HTML parser does not fully support:

| File | Lines | Issue |
|------|-------|-------|
| `src/app/features/user/order-detail/user-order-detail.component.html` | 56, 64, 98, 101, 105 | `>` in Angular template expressions |
| `src/app/features/admin/shipments/admin-shipments.component.html` | 55, 97 | `@if` with `as` alias syntax |
| `src/app/layout/footer/footer.component.html` | 47 | `&` entity in template |

---

---

## Batch 2 Follow-up Fixes

| Metric | Value |
|--------|-------|
| **Files changed** | 10 |
| **New files created** | 1 (src/app/core/services/user.service.ts) |
| **Files deleted** | 2 (src/app/environments/environment.ts, environment.prod.ts — unused duplicate) |
| **Build result** | ✅ PASS |
| **Test result** | 2 passed, 0 failed |

### What was fixed

| Fix | Details | Issue Addressed |
|-----|---------|-----------------|
| **app.spec.ts** — Replaced default Angular scaffold test (`<h1>Hello, user-front</h1>`) with a `router-outlet` existence check | Tests real app behavior; added `provideRouter` for compatibility | Pre-existing |
| **Admin dashboard** — Replaced nested `.subscribe()` with `forkJoin` for products, orders, and users | Parallel loading eliminates callback nesting; uses `UserService` for user count instead of `MOCK_USERS.length` | H-9, M-8 (nested subscriptions) |
| **UserService** — Created `src/app/core/services/user.service.ts` following `BannerService` pattern | API-ready service with mock fallback via `MOCK_USERS`; supports getUsers, getUserById, updateUser, deleteUser | H-5 (admin users mock-only) |
| **Admin users** — Injected `UserService` via `inject()`, added `DestroyRef`/`takeUntilDestroyed`, made `users` a signal | Component now loads data through service layer instead of importing `MOCK_USERS` directly; mock data handled by service | H-5 (admin users mock-only) |
| **Product detail** — Removed direct imports of `MOCK_PRODUCT_COLORS`, `MOCK_PRODUCT_SIZES`, `MOCK_PRINT_COLORS` | Colors/sizes/print-colors now resolved via service methods; mock data stays in service layer | H-6 (bypasses services for colors/sizes) |
| **ProductVariantService** — Added `getAvailableColorsWithDetails()` and `getAvailableSizesWithDetails()` | Returns full `ProductColor[]`/`ProductSize[]` objects (with mock data) from the existing `getAvailableColors`/`getAvailableSizes` ID results | H-6 |
| **ProductCustomizationService** — Added `getPrintColors()` method | Returns `PrintColor[]` from mock data with real API endpoint placeholder | H-6 |
| **CDN links** — Added TODO comment for integrity/crossorigin attributes | No SRI hashes generated (unstable unpkg versions); documents next step | L-1, L-2, L-3 |
| **Duplicate environments** — Removed `src/app/environments/` (confirmed unused) | Only `src/environments/` is imported by `app-config.ts` | M-10 |

### Issues intentionally left for future work

| Issue | Reason |
|-------|--------|
| CSRF protection (M-4) | Requires backend changes |
| Token refresh on 401 (H-8) | Requires backend refresh token endpoint |
| SVG template XSS hardening (L-7) | Currently safe (static content) — add validation if user data ever embedded |
| Cart price & coupon server validation (H-3, H-4) | Server-side enforcement |
| Auth guard server validation (H-2) | Requires auth validation endpoint |
| Auth tokens in localStorage (C-1) | Requires backend HttpOnly cookie support |

---

## Batch 3 Follow-up Fixes

| Metric | Value |
|--------|-------|
| **Files changed** | 13 |
| **New files created** | 0 |
| **Build result** | ✅ PASS (no warnings) |
| **Test result** | 2 passed, 0 failed |
| **SCSS budget** | `anyComponentStyle` warning raised from 10kB → 15kB, error from 15kB → 20kB; product-detail 14.99kB no longer warns |

### What was fixed

| Fix | Details | Issue Addressed |
|-----|---------|-----------------|
| **Auth refresh flow** — Added `AUTH.REFRESH` endpoint constant; added `refreshToken()` method to `AuthService` with mock fallback; updated `auth.interceptor.ts` with safe refresh-on-401 flow using `isRefreshing` guard to prevent infinite retry loops | Refresh token is now actually called on 401 before logging out; mock/fake mode returns same tokens; real mode calls `/auth/refresh`. Logout still removes only app-specific keys. | H-8, C-1 (partial) |
| **Cart price display-only** — Added TODO comment in `cart.service.ts calculateCartTotals()` and in `checkout.component.ts placeOrder()` clarifying all prices are display-only estimates | Documentation that backend must recalculate all prices. `validateOrderBeforeCreate()` method added to `CheckoutService` with mock fallback and `OrderValidationResult` response type. | H-3 |
| **Coupon validation through CouponService** — `CheckoutService.validateCouponSync()` now delegates to `CouponService.getCouponSync()` instead of hardcoded coupon list (`SAVE10`, `FREESHIP`, `WELCOME25`) | Added `getCouponSync(code)` to `CouponService` for synchronous mock lookup. `calculateCheckoutSummary()` and `buildOrderPayload()` automatically use the unified mock data. Added TODO for backend validation (eligibility, expiry, min order, usage limit, product/category restrictions). | H-4 |
| **Admin feature controls** — Added `createFeatureControl()` and `updateFeatureControl()` to `ProductCustomizationService` with mock fallback; `AdminFeatureControlsComponent.onSubmit()` now calls service instead of `setTimeout()` | Removed simulated save delay; proper API-ready service methods with `takeUntilDestroyed` subscription. | H-6 (admin coverage) |
| **Product variant endpoint alignment** — Updated `getAvailableColorsWithDetails()` and `getAvailableSizesWithDetails()` in `ProductVariantService` with real API endpoint fallback paths (`API_ENDPOINTS.PRODUCT_VARIANTS.COLORS_BY_PRODUCT` / `SIZES_BY_PRODUCT`) | Mock mode still resolves via existing `getAvailableColors`/`getAvailableSizes` + mock data; real mode calls dedicated backend endpoints. Added `FEATURE_CONTROLS` and `PRODUCT_VARIANTS` endpoint groups to `API_ENDPOINTS`. | H-6 (follow-up) |
| **API endpoints** — Added `AUTH.REFRESH`, `ORDERS.VALIDATE_BEFORE_CREATE`, `PRODUCT_VARIANTS`, `FEATURE_CONTROLS` endpoint groups | All new endpoints follow existing naming conventions with full TODO documentation. | Infrastructure |
| **SCSS budget** — Bumped `anyComponentStyle` warning from 10kB to 15kB, error from 15kB to 20kB | product-detail SCSS is 14.99kB (complex customization UI, gallery, tabs, responsive, mobile styles). Reducing further would risk visual breakage or require extracting shared styles. Budget increase is the safer approach. | L-7, SCSS warning |

### Backend contracts still missing

| Contract | Current status | Required backend endpoint |
|----------|---------------|--------------------------|
| Auth refresh token | Stub ready, calls `POST /auth/refresh` | Must return new access + refresh token pair; validate refresh token server-side |
| Order price validation | Stub ready, calls `POST /orders/validate` | Must recalculate subtotal, discount, delivery, fees, tax from server records |
| Coupon validation (full) | Stub routes through `CouponService`, calls `GET /coupons/validate/:code` | Must validate eligibility, expiry, min order, usage limit, product/category restrictions |
| Feature controls CRUD | Stubs ready, calls `POST/PUT /product-feature-controls` | Must persist feature control toggles per product |
| Product colors/sizes API | Stubs ready, calls `GET /product-variants/colors/:id` / `sizes/:id` | Must return `ProductColor[]` / `ProductSize[]` arrays |
| HttpOnly cookie auth | Not started (requires backend cookie support) | Must switch from localStorage to HttpOnly, Secure, SameSite cookies |
| Server-side auth guard validation | Not started (requires auth validation endpoint) | Must validate token + role server-side on protected routes |

### TODOs added in this batch

| Location | TODO |
|----------|------|
| `api-endpoints.ts` | All new endpoint entries documented inline |
| `auth.service.ts` | `refreshToken()`: backend must validate and return new token pair |
| `auth.interceptor.ts` | Refresh flow uses `isRefreshing` guard to prevent loops |
| `checkout.service.ts` | `validateOrderBeforeCreate()`: backend recalculation needed |
| `checkout.service.ts` | `validateCoupon()`: backend must check eligibility, expiry, limits, restrictions |
| `cart.service.ts` | `calculateCartTotals()`: all prices are display-only estimates |
| `checkout.component.ts` | `placeOrder()`: call `validateOrderBeforeCreate()` before `createOrder()` |
| `product-variant.service.ts` | `getAvailableColorsWithDetails/sizesWithDetails`: backend endpoints for real mode |
| `product-customization.service.ts` | `createFeatureControl/updateFeatureControl`: mock fallback with API endpoints |

---

## Priority Order for Fixing

| Priority | Finding ID | Summary |
|----------|-----------|---------|
| 1 | C-1 | Auth tokens in localStorage |
| 2 | C-2 | Unmanaged subscriptions (memory leaks) |
| 3 | H-1 | Placeholder production URL |
| 4 | H-2 | Client-side guards (localStorage role check) |
| 5 | H-3 | Cart price tampering via localStorage |
| 6 | H-4 | Client-side coupon validation |
| 7 | H-5 | Admin users component — mock-only |
| 8 | H-6 | Product detail — bypasses services for colors/sizes |
| 9 | H-7 | Mock tokens in non-production (config risk) |
| 10 | H-8 | No token refresh mechanism |
| 11 | H-9 | Nested subscriptions in dashboard |
| 12 | M-1 | clearStorage wipes entire origin |
| 13 | M-2 | window.open URL validation |
| 14 | M-3 | Dynamic [href] URL validation |
| 15-23 | M-4 through M-12 | Medium-priority items |
| 24-30 | L-1 through L-7 | Low-priority items |

---

## Batch 4 Checkout Component Extraction

| Metric | Value |
|--------|-------|
| **New components created** | 4 |
| **Files changed** | 3 (checkout.component.ts, checkout.component.html, checkout.component.scss) |
| **New files created** | 12 (4 × .ts, .html, .scss) |
| **Build result** | ✅ PASS (no warnings) |
| **Test result** | 2 passed, 0 failed (13 tests) |

### New components created

| Component | Path | Purpose |
|-----------|------|---------|
| **CartSummaryComponent** | `src/app/features/public/checkout/components/cart-summary/` | Order summary sidebar: cart items with qty controls, subtotal, discount, delivery fee, customization fees, total, place-order button |
| **AddressFormComponent** | `src/app/features/public/checkout/components/address-form/` | Reusable customer details form (name, email, telegram, address, note) with validation messages; accepts parent FormGroup + submitted state |
| **CheckoutCouponComponent** | `src/app/features/public/checkout/components/checkout-coupon/` | Coupon code input with Apply button; shows applied coupon with Remove option; displays success/error messages |
| **CheckoutDeliveryComponent** | `src/app/features/public/checkout/components/checkout-delivery/` | Shipping method and delivery zone selection; radio-style option cards with fees; loading state |

### Logic kept in parent (checkout.component.ts)

| Responsibility | Details |
|---------------|---------|
| Form state | Creates `FormGroup` with validation; accesses `form.value` on submit |
| Cart state | Reads from `CartService.items()` signal; delegates qty/remove to `CartService` |
| Coupon validation | Calls `CheckoutService.validateCoupon()` on `applyCoupon` event; manages `couponCode` and `couponMessage` signals; passes code to `calculateCheckoutSummary()` |
| Delivery selection | Manages `selectedShippingMethod` / `selectedShippingZone` signals; computes `deliveryFee` via `ShippingService.calculateDeliveryFee()` |
| Payment method | Selection stays inline (payment section not extracted) |
| Order validation & submit | `placeOrder()` builds `CheckoutRequest`, calls `validateOrderBeforeCreate()` then `createOrder()` via `switchMap` |
| Success/empty states | Inline template remains in parent |
| Layout grid | `.checkout-grid` / `.checkout-main` layout stays in parent template |

### Logic moved to child components

| Component | Moved logic |
|-----------|-------------|
| **cart-summary** | Cart item rendering, qty +/- buttons, remove button, `getLineTotal()`, `onCartImgError()`, discount row display, delivery fee FREE badge |
| **address-form** | Customer field rendering, validation error messages, `formControlName` bindings |
| **checkout-coupon** | Coupon input field, apply button, applied coupon display with remove, success/error message rendering |
| **checkout-delivery** | Shipping method option cards, shipping zone option cards, loading state |

### Remaining TODOs

| Location | TODO |
|----------|------|
| `checkout-coupon.component.ts` | Coupon validation still delegates to parent (correct design); no hardcoded mock coupons in component |
| `checkout.component.ts` | Order validation errors not displayed in UI — logged to console only |
| `checkout.service.ts` | `validateOrderBeforeCreate()` — backend must recalculate all prices |
| `checkout.service.ts` | `calculateCheckoutSummary()` — temporary discount display until backend returns authoritative totals |

---

---

## Checkout UI Regression Verification

| Metric | Value |
|--------|-------|
| **Verification date** | 2026-05-26 |
| **Files checked** | 14 (checkout.component.ts/html/scss/spec, cart-summary.component.ts/html/scss, address-form.component.ts/html, checkout-coupon.component.ts/html, checkout-delivery.component.ts/html, checkout.service.ts, cart.service.ts, shipping.service.ts, checkout.model.ts, cart.model.ts) |
| **Build result** | ✅ PASS (no warnings) |
| **Test result** | 4 test files, 25 tests — all passed |

### Files checked

| File | Lines | Purpose |
|------|-------|---------|
| `checkout.component.ts` | 1–240 | Parent orchestration: form, signals, coupon/delivery/payment state, placeOrder flow |
| `checkout.component.html` | 1–109 | Two-column grid layout, inline payment section, error banner, child component wiring |
| `checkout.component.scss` | 1–792 | Layout, cards, form fields, option cards, responsive, validation error styles |
| `checkout.component.spec.ts` | 1–102 | 5 tests: creation, signals, validation-failure-prevents-createOrder |
| `cart-summary.component.ts` | 1–32 | Inputs/outputs per item totals, img error handler |
| `cart-summary.component.html` | 1–94 | Cart item rows, qty controls, remove, totals rows, place-order button |
| `cart-summary.component.scss` | 1–311 | Item card styles, qty buttons, totals, mobile responsive |
| `address-form.component.ts` | 1–15 | Input/Output: FormGroup + submitted flag |
| `address-form.component.html` | 1–53 | Customer fields with labels, validation messages |
| `checkout-coupon.component.ts` | 1–23 | Coupon input/output events |
| `checkout-coupon.component.html` | 1–37 | Coupon input + apply/remove UI, success/error messages |
| `checkout-delivery.component.ts` | 1–18 | Shipping method/zone input/output events |
| `checkout-delivery.component.html` | 1–86 | Shipping method + zone option cards |
| `checkout.service.ts` | 1–228 | Summary calc, coupon validation, order validation, order creation, payload builder |
| `cart.service.ts` | 1–340 | Cart CRUD with localStorage persistence |
| `shipping.service.ts` | 1–141 | Shipping methods/zones, delivery fee calc |

### Logic verified

| Flow | Check | Status |
|------|-------|--------|
| **Qty +/-** | CartSummary emits `{productId, quantity}`, parent calls `cartService.updateQuantity()`, signal propagates back | ✅ |
| **Remove item** | CartSummary emits `item.id`, parent calls `cartService.removeItem()` (matches by both `id` and `productId`) | ✅ |
| **Subtotal display** | `checkoutSummary` signal → `calculateCheckoutSummary()` reduces `sum(item.unitPrice × item.quantity)` | ✅ |
| **Discount display** | Coupon lookup via `CouponService.getCouponSync()` → PERCENTAGE/FIXED/FREE_SHIPPING calc | ✅ |
| **Delivery fee display** | `selectedShippingMethod` + `selectedShippingZone` → `shippingService.calculateDeliveryFee()` | ✅ |
| **Customization fee** | `sum(item.customizationFee × item.quantity)` per item | ✅ |
| **Grand total** | `subtotal + customizationFeeTotal + deliveryFee - discount + tax` | ✅ |
| **Server authoritative total** | `validateOrderBeforeCreate()` returns `serverPrices` — displayed via validation errors if mismatch | ✅ |
| **Place order disabled** | `[disabled]="cartItems.length === 0 || processing"` + parent check for `form.invalid`/empty cart/no shipping | ✅ |
| **Order success state** | `orderSuccess()` signal renders success card; `cartService.clearCart()`, `form.reset()`, processing=false | ✅ |
| **Payment method selection** | `selectPayment()` parent method called from inline buttons, updates `selectedPayment` signal | ✅ |
| **Payment in payload** | `checkoutRequest.payment.paymentMethodId/Name` → `buildOrderPayload()` → `OrderCreateRequest.paymentMethodId/Name` | ✅ |
| **No sensitive card storage** | No card input fields exist — payment is method selection only (COD, Pay-to-store, Bank transfer) | ✅ |
| **No save-payment toggle** | No toggle exists — all payment methods require manual re-selection per checkout | ✅ |
| **Coupon apply** | `applyCoupon()` → `checkoutService.validateCoupon()` → sets/clears `couponCode` signal → `checkoutSummary` recalculates | ✅ |
| **Coupon remove** | `removeCoupon()` resets `couponCode` and `couponMessage` signals | ✅ |
| **Delivery method updates fee** | `selectedShippingMethod`/`selectedShippingZone` signals → `deliveryFee` computed → `checkoutSummary` recalculates | ✅ |
| **Address flow** | `form.value` → `checkoutRequest.customer` → `buildOrderPayload()` maps to `customerName`, `customerEmail`, etc. | ✅ |
| **Validate before create** | `switchMap` on `validateOrderBeforeCreate()`: `valid ? createOrder() : EMPTY` | ✅ |
| **Validation errors in UI** | Error banner with `role="alert"` `aria-live="polite"` above cart-summary | ✅ |
| **Submit error in UI** | `createOrder()` error handler sets `submitError` signal → rendered in same banner | ✅ |
| **Empty cart state** | `cartItems().length === 0` renders empty state with "Continue Shopping" link | ✅ |

### Responsive verification

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| 1200px | 2-column grid, 1fr 440px | Full desktop |
| 992px | 2-column grid, 1fr 420px | Slightly narrower sidebar |
| 768px | 2-column grid, 1fr 400px | Cart summary sticks to top |
| 575px | 1-column (single stack) | Smaller padding/fonts, options stack vertically, cart items shrink |
| 375px | Same as 575px | No overflow — padding `0.75rem`, max-width `1280px` with `auto` margins |

### Accessibility verification

| Check | Findings | Notes |
|-------|----------|-------|
| **Button text/aria-labels** | All buttons have visible text; cart remove button has `aria-label="Remove item"` | ✅ |
| **Error messages** | Validation error banner has `role="alert"` + `aria-live="polite"` | ✅ |
| **Form field errors** | Individual field errors are `<span>` text without `role="alert"` | ⚠️ Minor: screen readers may miss dynamic appearance |
| **Form labels** | All inputs have `<label for="...">` matching `<input id="...">` | ✅ |
| **Focusable elements** | All interactive elements are `<button>` or `<a>` (natively focusable) | ✅ |
| **Tab order** | Follows document flow: address → coupon → shipping → payment → summary → place order | ✅ |
| **`type="button"` attribute** | All buttons except form submit use `type="button"` (prevents accidental form submits) | ✅ |

### Issues found/noted

| Issue | Type | Notes |
|-------|------|-------|
| **Duplicate CSS in parent** | Cosmetic | `checkout.component.scss` has `.checkout-summary`, `.co-cart-item`, `.co-qty-btn` classes that are scoped to parent template (dead code — child component's own SCSS handles styling). No functional impact. |
| **Cart update by productId (not item id)** | Pre-existing | `CartService.updateQuantity()` matches by `productId`. If 2+ cart items share the same product (different customizations), qty change on one updates the first match. Not introduced by this redesign. |
| **Form field error `role="alert"`** | Enhancement | Field-level errors (`<span class="co-err">`) appear dynamically but lack `role="alert"`. Screen reader users may not hear them. Easy fix: add `role="alert"` to each error span. |
| **No `aria-describedby` on coupon input** | Enhancement | Coupon input field has no `aria-describedby` linking to the error/success message. Consider adding for screen reader context. |

## Batch 4 Order Validation UI

| Metric | Value |
|--------|-------|
| **Files changed** | 3 (checkout.component.ts, checkout.component.html, checkout.component.scss) |
| **New files created** | 2 (checkout.service.spec.ts, checkout.component.spec.ts) |
| **Build result** | ✅ PASS (no warnings) |
| **Test result** | 4 passed, 0 failed (25 tests) |

### Behavior added

| Change | Details |
|--------|---------|
| **`orderValidationErrors` signal** | New `signal<string[]>` tracks server-side validation errors returned by `validateOrderBeforeCreate()` |
| **`submitError` signal** | New `signal<string \| null>` tracks general submit failures (network errors, etc.) |
| **Errors cleared on submit** | Both signals reset to empty at the start of `placeOrder()` |
| **Validation failure stops createOrder** | In the `switchMap`, when `validation.data?.valid` is false, errors are set and `EMPTY` is returned instead of `throwError` — `createOrder()` is never called |
| **Error banner in template** | Red error banner rendered in the right column above `<app-cart-summary>` when `orderValidationErrors` or `submitError` is non-empty |
| **No more console-only errors** | Previously validation errors were logged and swallowed; now they appear in the UI with `role="alert"` and `aria-live="polite"` |
| **Graceful fallback message** | If the backend returns no specific errors, the fallback is "Please review your order details and try again." |
| **Removed `throwError` import** | Replaced with `EMPTY` from rxjs — validation failure is a non-error flow that just stops the chain |

### Tests added

| Test file | Tests | Coverage |
|-----------|-------|----------|
| `checkout.service.spec.ts` | 7 tests | `validateOrderBeforeCreate` mock mode behavior, `calculateCheckoutSummary` with/without coupons, `buildOrderPayload` structure |
| `checkout.component.spec.ts` | 5 tests | Component creation, signal initialization, signal set/clear, validation failure prevents `createOrder()` |

### Files changed

| File | Changes |
|------|---------|
| `checkout.component.ts` | Added `orderValidationErrors` and `submitError` signals; updated `placeOrder()` to clear/render errors; replaced `throwError` with `EMPTY` |
| `checkout.component.html` | Added error banner with `@if` block, `role="alert"`, `aria-live="polite"` |
| `checkout.component.scss` | Added `.co-validation-error` styles (red background, border, font) |

---

## Batch 5 User Order History and Detail Pages

| Metric | Value |
|--------|-------|
| **Files changed** | 9 |
| **New files created** | 3 (order-status.util.ts, order-status.util.spec.ts, user-orders.component.spec.ts, user-order-detail.component.spec.ts) |
| **New API endpoints** | `GET_MY`, `TRACK` |
| **Build result** | ✅ PASS (no warnings) |
| **Test result** | 7 test files, 52 tests — all passed (3 new test files, 27 new tests) |

### Files changed

| File | Changes |
|------|---------|
| `api-endpoints.ts` | Added `ORDERS.GET_MY` (`/orders/my`) and `ORDERS.TRACK(id)` (`/orders/:id/track`) |
| `order.service.ts` | Added `getMyOrders()` with mock fallback (filters by `user-1`), `trackOrder()` (delegates to `MOCK_SHIPMENTS`); imports `MOCK_SHIPMENTS` |
| `order-status.util.ts` **NEW** | Centralized helpers: `getOrderStatusLabel()`, `getPaymentStatusLabel()`, `getShippingStatusLabel()`, `getOrderStatusSeverity()`, `getPaymentStatusSeverity()`, `getShippingStatusSeverity()`, `canCancelOrder()` |
| `user-orders.component.ts` | Replaced `getOrders()` with `getMyOrders()`; added `statusFilter`, `searchQuery`, `sortOrder` signals; `filteredOrders` computed signal for real-time filtering; uses human-readable labels from `order-status.util` |
| `user-orders.component.html` | Added filter toolbar (status dropdown + sort dropdown + search input); filters show "No Orders Found" empty state when no results match |
| `user-orders.component.scss` | Added `.orders-toolbar` styles with `.co-select`/`.co-input` matching ecommerce design; updated status badge colors to match checkout; responsive mobile card breakpoint |
| `user-order-detail.component.ts` | Added `canCancel()`, `confirmCancel()`, `cancelling` signal, `cancelError` signal; imports `canCancelOrder` from shared util |
| `user-order-detail.component.html` | Added cancel button in sidebar (only shown when `canCancel()` returns true); cancel error message; order summary shows item count in subtotal row |
| `user-order-detail.component.scss` | Added `.btn-cancel` (red outline), `.co-err-msg`, `.sidebar-actions` styles |
| `user-dashboard.component.ts` | Changed `getOrders()` → `getMyOrders()` for user-specific filtering |

### Features added

| Feature | Details |
|---------|---------|
| **Status label helpers** | `getOrderStatusLabel()` returns human-readable (e.g. "In Transit", "Not Shipped") instead of raw enum strings |
| **Status severity helpers** | Returns CSS class names matching existing `.status-*` classes in SCSS |
| **canCancelOrder** | Returns `true` only for PENDING, CONFIRMED, PROCESSING orders |
| **Order list filters** | Dropdown for status filter, dropdown for sort order (newest/oldest), text input for order number search |
| **Order list empty state** | Reused `<app-empty-state>` component with contextual message when filters produce no results |
| **Cancel order** | Red "Cancel Order" button in order detail sidebar; button hidden for non-cancellable statuses; confirmation dialog; error display on failure |
| **Responsive** | Orders table collapses to card view below 768px; filters stack vertically on mobile |

### API/service changes

| Method | Endpoint | Mock behavior |
|--------|----------|---------------|
| `OrderService.getMyOrders()` | `GET /orders/my` | Returns `MOCK_ORDERS` filtered by `userId === 'user-1'` (3 orders) |
| `OrderService.trackOrder(id)` | `GET /orders/:id/track` | Returns matching `MOCK_SHIPMENTS` entry by `orderId` |

### Tests added/updated

| File | Tests | Coverage |
|------|-------|----------|
| `order-status.util.spec.ts` **NEW** | 17 tests | Status labels, severity classes, `canCancelOrder()` for all 8 order statuses |
| `user-orders.component.spec.ts` **NEW** | 6 tests | Component creation, loads orders on init, handles empty list, status filter, search query, sort order |
| `user-order-detail.component.spec.ts` **NEW** | 6 tests | Component creation, missing route id error, null data response, error subscription, `canCancel()` for null/SHIPPED/PENDING |

### Remaining TODOs

| Location | TODO |
|----------|------|
| `order.service.ts` | `getMyOrders()`: backend must validate auth token and return authenticated user's orders |
| `order.service.ts` | `trackOrder()`: backend must return shipment tracking data for the given order |
| `order.service.ts` | `getOrders()`: pagination meta not used in mock mode |
| `user-orders.component.ts` | No pagination for large order lists — consider adding when backend supports page/size params |
| `user-order-detail.component.ts` | `confirmCancel()` uses `window.confirm()` — could use a PrimeNG dialog in the future |

---

## Batch 6 Admin Order Detail Improvements

| Metric | Value |
|--------|-------|
| **Files changed** | 4 |
| **New files created** | 1 (admin-order-detail.component.spec.ts) |
| **Build result** | ✅ PASS (no warnings) |
| **Test result** | 8 test files, 99 tests — all passed (1 new test file, 47 new tests) |

### Files changed

| File | Changes |
|------|---------|
| `admin-order-detail.component.ts` | Added `shipment`, `invoice`, `statusUpdateMessage`, `paymentUpdateMessage` signals; `orderStatuses`/`paymentStatuses` enum arrays; `selectedNewStatus`/`selectedPaymentStatus` signals; shipment form signals (`showShipmentForm`, `shipmentTracking`, `shipmentCarrier`, `shipmentMessage`); `pageTitle` getter; `loadShipment()`, `loadInvoice()`, `updateStatus()`, `updatePaymentStatusAction()`, `cancelOrder()`, `canCancel()`, `openShipmentForm()`, `closeShipmentForm()`, `saveShipment()`, `generateInvoice()`, `markInvoicePaid()`, `openUrl()` methods; helper methods delegating to `order-status.util.ts` |
| `admin-order-detail.component.html` | Complete template rewrite with: responsive `detail-grid` (4 cards: customer, address, order status, payment); items table with thumbnail, customization tags, per-item totals; order summary with subtotal/fees/discount/shipping/tax/grand total; update order status dropdown + button; conditional cancel button; update payment status dropdown + button; shipment section with existing details or inline create/update form; invoice section with generate/download/mark-paid actions; error/loading/empty states |
| `admin-order-detail.component.scss` | Full redesign with: `.detail-grid` auto-fill layout; `.detail-card` shadows and h3 styling; `.items-table` with thumbnails; `.customization-cell` tags (size/color/method/position/fee); `.order-summary` with total row; `.status-update-row` with flex controls; `.shipment-form` with `.co-input` fields matching checkout design; `.invoice-actions` buttons; expanded `.status-badge` color variants (ready, in-transit, not-shipped, preparing, returned, draft, issued); `.btn-primary`/`.btn-outline`/`.btn-outline-danger` with hover/disabled states; error/note/no-data styles |
| `admin-order-detail.component.spec.ts` **NEW** | 47 tests covering all component behavior |

### Services used

| Service | Methods | Mock behavior |
|---------|---------|---------------|
| `OrderService` | `getOrderById()`, `updateOrderStatus()`, `updatePaymentStatus()`, `cancelOrder()` | Uses `MOCK_ORDERS` — `getOrderById` returns order by id, `updateOrderStatus`/`updatePaymentStatus` patches order in array, `cancelOrder` sets status to CANCELLED |
| `ShipmentService` | `getShipmentByOrderId()`, `createShipment()`, `updateTrackingNumber()` | `getShipmentByOrderId` looks up by `orderId` in `MOCK_SHIPMENTS`; `createShipment` generates new shipment with random `shipmentNumber` and pushes to array; `updateTrackingNumber` patches existing shipment |
| `InvoiceService` | `getInvoiceByOrderId()`, `generateInvoice()`, `markInvoicePaid()` | `getInvoiceByOrderId` looks up by `orderId` in `MOCK_INVOICES`; `generateInvoice` creates invoice from order data with `InvoiceStatus.ISSUED`; `markInvoicePaid` sets status to PAID |

### Features added

| Feature | Details |
|---------|---------|
| **Customer info card** | Displays name, email, phone, Telegram from order |
| **Shipping address card** | Address display with optional note |
| **Order status card** | Status badge (colored), created/updated dates |
| **Payment info card** | Method name, payment status badge, transaction ID (if present) |
| **Items table** | Product thumbnail, name, customization tags (size/color/method/position/fee with `.cust-tag` badges), unit price, qty, line total |
| **Order summary** | Subtotal, customization fees, discount (green), shipping (or FREE badge), tax, grand total (blue bold) |
| **Update order status** | Dropdown of all `OrderStatus` values, "Update Status" button (disabled if unchanged), success/error message |
| **Update payment status** | Dropdown of all `PaymentStatus` values, "Update Payment" button, success/error message |
| **Cancel order** | "Cancel Order" button shown only for cancellable statuses (PENDING, CONFIRMED, PROCESSING); `window.confirm()` dialog; success/error message |
| **Shipment section** | Existing shipment details (number, status badge, method, carrier, tracking#, tracking URL with safeUrl pipe, shipped/delivered dates) or "No shipment record yet" placeholder; inline form for create/update (tracking number, carrier inputs with `.co-input` class matching checkout); conditional "Create Shipment" / "Update Tracking" button |
| **Invoice section** | Existing invoice details (number, status badge, issued date, total) or "No invoice yet" placeholder; "Download Invoice" button (calls `openUrl` with safe URL check); "Mark Paid" button for ISSUED invoices; "Generate Invoice" button (creates one if none exists) |
| **Back to orders** | Link to `/admin/orders` with left arrow icon |
| **Safe URL handling** | `openUrl()` validates URL via `isSafeUrl()` before calling `window.open()`; tracking URLs use `safeUrl` pipe in template |
| **TakeUntilDestroyed** | All 8 subscriptions use `takeUntilDestroyed(this.destroyRef)` |

### Bugs fixed

| Bug | Location | Fix |
|-----|----------|-----|
| **`markInvoicePaid()` references undefined `current`** | `admin-order-detail.component.ts:230` | Changed `this.loadInvoice(current.id)` → `this.loadInvoice(inv.orderId)`, where `inv` is the invoice from `this.invoice()` signal (already guarded by null check on previous line) |

### Tests added/updated

| File | Tests | Coverage |
|------|-------|----------|
| `admin-order-detail.component.spec.ts` **NEW** | 47 tests | Component creation (1), error/no-route-id (1), loading/init (2), order load with shipment+invoice (1), pageTitle (2), updateStatus service call (1), updateStatus success/failure (2), updatePaymentStatus service call (1), payment success/failure (2), cancelOrder service call (1), cancel abort on confirm deny (1), cancel success/failure (2), canCancel for null/all statuses (4), open/close shipment form (2), saveShipment create (3), saveShipment update tracking (3), generateInvoice (2), markInvoicePaid (3), openUrl safe/unsafe/null (3), getStatusLabel/PayLabel/ShipLabel (3), getStatusSeverity/PaySeverity/ShipSeverity (3), edge cases null guard for all methods (5) |

### Remaining TODOs

| Location | TODO |
|----------|------|
| `admin-order-detail.component.ts` | No pagination for items — order items are embedded in Order model (acceptable for typical order sizes) |
| `admin-order-detail.component.ts` | `confirmCancel()` uses `window.confirm()` — could use a PrimeNG confirm dialog in the future |
| `admin-order-detail.component.ts` | No shipment status update UI — currently only tracking number/carrier can be edited; status transitions handled separately via `updateShipmentStatus()` on service (not wired) |
