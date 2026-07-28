import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ============ USER ROUTES (lazy-loaded with layout) ============
  {
    path: 'user',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/user-layout/user-layout.component').then((m) => m.UserLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/user/dashboard/user-dashboard.component').then(
            (m) => m.UserDashboardComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/user/profile/user-profile.component').then((m) => m.UserProfileComponent),
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('./features/user/addresses/user-addresses.component').then(
            (m) => m.UserAddressesComponent,
          ),
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/user/orders/user-orders.component').then(
                (m) => m.UserOrdersComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/user/order-detail/user-order-detail.component').then(
                (m) => m.UserOrderDetailComponent,
              ),
          },
        ],
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./features/user/wishlist/user-wishlist.component').then(
            (m) => m.UserWishlistComponent,
          ),
      },
    ],
  },

  // ============ ADMIN ROUTES (lazy-loaded with layout) ============
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/products/admin-products.component').then(
                (m) => m.AdminProductsComponent,
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/admin/product-form/admin-product-form.component').then(
                (m) => m.AdminProductFormComponent,
              ),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./features/admin/product-form/admin-product-form.component').then(
                (m) => m.AdminProductFormComponent,
              ),
          },
        ],
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/admin-categories.component').then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/admin/orders/admin-orders.component').then(
                (m) => m.AdminOrdersComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/admin/order-detail/admin-order-detail.component').then(
                (m) => m.AdminOrderDetailComponent,
              ),
          },
        ],
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'banners',
        loadComponent: () =>
          import('./features/admin/banners/admin-banners.component').then(
            (m) => m.AdminBannersComponent,
          ),
      },
      {
        path: 'coupons',
        loadComponent: () =>
          import('./features/admin/coupons/admin-coupons.component').then(
            (m) => m.AdminCouponsComponent,
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/admin/reviews/admin-reviews.component').then(
            (m) => m.AdminReviewsComponent,
          ),
      },
      {
        path: 'payment-methods',
        loadComponent: () =>
          import('./features/admin/payment-methods/admin-payment-methods.component').then(
            (m) => m.AdminPaymentMethodsComponent,
          ),
      },
      {
        path: 'shipping-methods',
        loadComponent: () =>
          import('./features/admin/shipping-methods/admin-shipping-methods.component').then(
            (m) => m.AdminShippingMethodsComponent,
          ),
      },
      {
        path: 'shipping-zones',
        loadComponent: () =>
          import('./features/admin/shipping-zones/admin-shipping-zones.component').then(
            (m) => m.AdminShippingZonesComponent,
          ),
      },
      {
        path: 'shipments',
        loadComponent: () =>
          import('./features/admin/shipments/admin-shipments.component').then(
            (m) => m.AdminShipmentsComponent,
          ),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./features/admin/invoices/admin-invoices.component').then(
            (m) => m.AdminInvoicesComponent,
          ),
      },

      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
      },
    ],
  },

  // ============ PUBLIC ROUTES (wrapped in PublicLayoutComponent) ============
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/public/products/products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/public/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/public/categories/categories.component').then((m) => m.CategoriesComponent),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/public/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/public/checkout/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/public/search/search.component').then((m) => m.SearchComponent),
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            loadComponent: () =>
              import('./features/auth/login/login.component').then((m) => m.LoginComponent),
          },
          {
            path: 'register',
            loadComponent: () =>
              import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
          },
          {
            path: 'forgot-password',
            loadComponent: () =>
              import('./features/auth/forgot-password/forgot-password.component').then(
                (m) => m.ForgotPasswordComponent,
              ),
          },
          {
            path: 'reset-password',
            loadComponent: () =>
              import('./features/auth/reset-password/reset-password.component').then(
                (m) => m.ResetPasswordComponent,
              ),
          },
        ],
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./features/public/help/help.component').then(
            (m) => m.HelpComponent,
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/contact/contact.component').then(
            (m) => m.ContactComponent,
          ),
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./features/public/faq/faq.component').then(
            (m) => m.FaqComponent,
          ),
      },
      {
        path: 'refund-policy',
        loadComponent: () =>
          import('./features/public/refund-policy/refund-policy.component').then(
            (m) => m.RefundPolicyComponent,
          ),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./features/public/privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent,
          ),
      },
      {
        path: 'terms-of-service',
        loadComponent: () =>
          import('./features/public/terms-of-service/terms-of-service.component').then(
            (m) => m.TermsOfServiceComponent,
          ),
      },
      {
        path: 'cookies',
        loadComponent: () =>
          import('./features/public/cookies/cookies.component').then(
            (m) => m.CookiesComponent,
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/public/page-not-found/not-found.component').then(
            (m) => m.NotFoundComponent,
          ),
      },
    ],
  },
];
