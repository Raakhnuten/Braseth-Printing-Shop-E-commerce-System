---
name: ecommerce-frontend-design
description: MUST use this skill when designing, polishing, or refactoring ecommerce frontend UI/UX, especially Angular, PrimeNG, responsive layouts, product cards, product detail pages, cart, checkout, auth pages, dashboards, admin CRUD pages, mobile ecommerce app-like UI, banners, categories, navigation, filters, and conversion-focused ecommerce pages.
license: MIT
compatibility: 'OpenCode'
metadata:
  project-type: 'ecommerce-frontend'
  stack: 'Angular, PrimeNG, SCSS'
---

# Ecommerce Frontend Design Skill

Use this skill to design or improve a production-quality ecommerce frontend.

## Main Goal

Create a clean, modern, responsive ecommerce UI that feels like a real shopping website, not a basic admin template.

The design must be:

- Mobile-first
- Clean and premium
- Easy to scan
- Conversion-focused
- API-ready
- Reusable through components
- Consistent across all pages

## Project Assumptions

Default stack:

- Angular standalone components
- PrimeNG components where useful
- SCSS
- Lazy-loaded routes
- Services for data logic
- Interfaces/models for product, category, cart, order, user, banner, coupon, review, payment method
- Mock/fake API data must stay outside components

Do not hardcode large data arrays inside UI components.

## Visual Design Rules

Use this style direction:

- Background: soft neutral, usually `#f6f7f9`, `#f8fafc`, or white
- Cards: white, rounded 16px–24px, soft shadow, subtle border
- Main text: dark neutral `#111827` or `#1f2937`
- Muted text: `#6b7280`
- Primary action: strong visible CTA color
- Use consistent spacing: 8px system, usually 16px, 24px, 32px
- Avoid cramped layouts
- Avoid too many borders
- Avoid oversized empty sections
- Use hover states, active states, and loading states

## Header / Navigation Requirements

Desktop header should usually have two rows:

### Top Row

Include:

- Logo
- Categories button
- Deals button
- Large rounded search bar
- Account icon/link
- Cart icon with badge
- Mobile menu button hidden on desktop

### Bottom Row

Include:

- Main category links
- Language selector
- Currency selector

Rules:

- Header must be sticky or visually stable
- Active links need underline or strong visual state
- Search must be large and easy to use
- Cart badge must be visible
- On mobile, collapse into app-like header

## Mobile UI Requirements

When opened on phone, the ecommerce site should feel like a mobile shopping app.

Mobile layout should include:

- Compact top app bar
- Search bar near top
- Horizontal category chips
- Product cards in 2-column grid where possible
- Bottom navigation if useful
- Sticky cart/checkout CTA where useful
- Large tap targets
- No horizontal overflow
- Product images must not stretch badly
- Checkout must be simple and stacked vertically

Breakpoints:

- Mobile: below 640px
- Tablet: 640px–960px
- Desktop: above 960px

## Home Page Requirements

Home page should include:

- Hero/banner slider
- Category section
- Featured products
- New arrivals
- Deals/discount section
- Trust badges
- Recommended products
- SEO-friendly content block
- Newsletter or footer CTA

Do not make the home page empty or only product cards.

## Product Card Requirements

Each product card should include:

- Product image
- Category or small label
- Product name
- Price
- Old price/discount if available
- Rating/review count if available
- Wishlist button
- Add to cart button
- Stock status only if useful

Rules:

- Product image area must be consistent height
- Long names must clamp to 2 lines
- Price must be visually clear
- CTA must be easy to tap on mobile
- Cards should align nicely in grid

## Product Listing Page Requirements

Product listing page should include:

- Page title and result count
- Search/filter/sort controls
- Category filter
- Price filter
- Brand/color/size filters if data exists
- Product grid
- Empty state
- Loading skeleton
- Pagination or infinite scroll

Desktop:

- Sidebar filters + product grid

Mobile:

- Filter drawer or bottom sheet
- Sort dropdown
- 2-column product grid

## Product Detail Page Requirements

Product detail page must include:

- Image gallery
- Thumbnail images
- Product title
- Price
- Rating/reviews
- Stock status
- Short description
- Variant selectors if available:
  - color
  - size
  - quantity
- Add to cart button
- Buy now button if needed
- Wishlist/share buttons
- Delivery/payment info
- Tabs or sections:
  - Description
  - Specifications
  - Reviews
  - Shipping/Returns
- Related products

Rules:

- Put stock status near product info, not floating randomly
- CTA buttons must be prominent
- Gallery must work on mobile
- Never show only one image if multiple images exist
- Use fallback image handling

## Cart Page Requirements

Cart page should include:

- Cart item list
- Image, name, variant, price
- Quantity stepper
- Remove button
- Subtotal per item
- Order summary
- Coupon input
- Checkout button
- Continue shopping link

Desktop:

- Cart items left
- Summary right

Mobile:

- Cart cards stacked
- 2 items per row only if readable
- Sticky checkout summary/button is allowed

## Checkout Page Requirements

Checkout must include:

Customer Details:

- Name
- Email
- Phone or Telegram username if project requires
- Address
- Note/remark

Shipping Method:

- Phnom Penh / Free
- Province
- J&T
- VET
- Other configured methods

Payment Method:

- Pay to Store
- Cash on Delivery
- Direct Bank Transfer
- ABA / bank / QR if available
- Card/Stripe/PayPal if available

Payment Summary:

- Subtotal
- Delivery fee
- Discount
- Total
- Place order button

Rules:

- Checkout should be simple and not visually messy
- Payment methods should look like selectable cards
- Selected payment should be obvious
- Required fields must show validation
- Mobile checkout must stack cleanly

## Auth Pages Requirements

Login/register/forgot password pages should:

- Use centered card layout
- Have clean inputs
- Show validation errors
- Include password visibility toggle
- Include social login placeholder only if project supports it
- Be mobile friendly

## User Dashboard Requirements

User dashboard should include:

- Profile overview
- Orders
- Addresses
- Wishlist
- Reviews
- Payment methods if supported
- Account settings

Use simple clean cards and tables.

## Admin Dashboard Requirements

Admin dashboard should include:

- Stats cards
- Recent orders
- Product management
- Category management
- Banner/slider management
- Coupon management
- Review approval
- Payment method management
- Feature toggles
- Product visibility/status controls

Admin CRUD pages must have:

- Search
- Filter
- Table
- Create/edit modal or page
- Delete confirmation
- Status toggle
- Empty state
- Loading state

## Component Architecture

Prefer reusable components:

- HeaderComponent
- FooterComponent
- ProductCardComponent
- ProductGridComponent
- CategoryCardComponent
- BannerSliderComponent
- PriceSummaryComponent
- QuantitySelectorComponent
- PaymentMethodSelectorComponent
- ShippingMethodSelectorComponent
- EmptyStateComponent
- LoadingSkeletonComponent
- ConfirmDialogComponent

Do not duplicate UI logic across pages.

## Angular / PrimeNG Rules

Use PrimeNG where it improves speed and quality:

- Button
- InputText
- Dropdown / Select
- Dialog
- Table
- Card
- Carousel
- Toast
- ConfirmDialog
- Sidebar / Drawer
- Rating
- Tag
- Badge
- Skeleton

But do not make the UI look like a default PrimeNG demo. Customize with SCSS.

## SCSS Rules

Use:

- CSS variables where useful
- Responsive mixins or clear media queries
- `clamp()` for responsive font sizes
- Grid/flex layouts
- `object-fit: cover` for product images
- `line-clamp` for long product names

Avoid:

- Huge one-file SCSS when possible
- Deep nested selectors
- Magic pixel layouts
- Horizontal overflow
- `!important` unless necessary

## Data / API Readiness

UI must work with:

- Mock data
- Fake API data
- Real Spring Boot API later

Rules:

- Components should consume services
- Services should map API data into frontend models
- Use interfaces
- Normalize product images
- Handle missing/null data
- Use fallback images
- Do not assume every product has variants

## UX States Required

Every major page should include:

- Loading state
- Empty state
- Error state
- Success toast where needed
- Disabled button state
- Responsive behavior

## Accessibility Rules

Must include:

- Real buttons for actions
- Labels for form fields
- Keyboard-friendly controls
- Alt text for product images
- Visible focus states
- Sufficient color contrast

## Before Editing

Before changing code:

1. Inspect existing structure.
2. Identify framework version and styling method.
3. Reuse existing components/services if available.
4. Do not rewrite completed working features unless necessary.
5. Preserve API-ready architecture.

## After Editing

After changes:

1. Run build or typecheck if available.
2. Fix compile errors.
3. Check responsive layout.
4. Check mobile width around 375px.
5. Report changed files.
6. Report what UI/UX was improved.
7. Mention any remaining warnings separately.

## Output Format

When finishing, report:

- Summary
- Changed files
- UI/UX improvements
- Responsive behavior
- Build/test result
- Remaining issues, if any

Keep the report clear and specific.
