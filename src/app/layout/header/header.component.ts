import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';

export interface NavSubcategory {
  name: string;
  route: string;
}

export interface NavCategory {
  name: string;
  route: string;
  subcategories: NavSubcategory[];
  featured?: { label: string; route: string }[];
  isMore?: boolean;
}

export interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  action?: string;
  danger?: boolean;
}

export interface MenuSection {
  label?: string;
  items: MenuItem[];
}

const LOGGED_IN_SECTIONS: MenuSection[] = [
  {
    label: 'My Account',
    items: [
      { icon: 'pi-th-large', label: 'Dashboard', route: '/user/dashboard' },
      { icon: 'pi-box', label: 'Orders', route: '/user/orders' },
      { icon: 'pi-heart', label: 'Wishlist', route: '/user/wishlist' },
      { icon: 'pi-user', label: 'Profile', route: '/user/profile' },
      { icon: 'pi-map-marker', label: 'Addresses', route: '/user/addresses' },
    ],
  },
  {
    label: 'Shopping',
    items: [
      { icon: 'pi-th-large', label: 'Browse Products', route: '/products' },
      { icon: 'pi-shopping-cart', label: 'Cart', route: '/cart' },
    ],
  },
  {
    items: [
      { icon: 'pi-shield', label: 'Admin Dashboard', route: '/admin/dashboard' },
    ],
  },
  {
    items: [
      { icon: 'pi-sign-out', label: 'Logout', action: 'logout', danger: true },
    ],
  },
];

const LOGGED_OUT_SECTIONS: MenuSection[] = [
  {
    items: [
      { icon: 'pi-th-large', label: 'Browse Products', route: '/products' },
    ],
  },
];

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [RouterLink, RouterLinkActive, FormsModule, NgClass],
})
export class HeaderComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);
  protected cartService = inject(CartService);
  private categoryService = inject(CategoryService);

  private readonly MAX_NAV_ITEMS = 7;

  readonly navCategories = toSignal(
    this.categoryService.getCategories().pipe(
      map(res => this.buildNavCategories(res.data || [])),
    ),
    { initialValue: [] },
  );

  private buildNavCategories(categories: Category[]): NavCategory[] {
    const all = categories.filter(c => c.enabled);
    const parents = all
      .filter(c => c.parentId === null)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const result: NavCategory[] = parents.map(parent => ({
      name: parent.name,
      route: parent.slug ? `/products?category=${parent.slug}` : '/products',
      subcategories: all
        .filter(c => c.parentId === parent.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(child => ({
          name: child.name,
          route: child.slug ? `/products?category=${child.slug}` : '/products',
        })),
    }));

    if (result.length > this.MAX_NAV_ITEMS) {
      const overflow = result.splice(this.MAX_NAV_ITEMS);
      result.push({
        name: 'More',
        route: '/products',
        isMore: true,
        subcategories: overflow.flatMap(cat => [
          { name: `All ${cat.name}`, route: cat.route },
          ...cat.subcategories,
        ]),
      });
    }

    return result;
  }

  mobileMenuOpen = false;
  searchMobileOpen = false;
  searchQuery = '';

  activeDropdown = signal<string | null>(null);
  expandedMobileCategory = signal<string | null>(null);

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get displayName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  get cartCount(): number {
    return this.cartService.getCartItemCount();
  }

  get userInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  get userEmail(): string {
    return this.authService.getCurrentUser()?.email ?? '';
  }

  get menuSections(): MenuSection[] {
    if (!this.isLoggedIn) return LOGGED_OUT_SECTIONS;
    return LOGGED_IN_SECTIONS.filter((section) => {
      if (section.items.length === 1 && section.items[0].route === '/admin/dashboard') {
        return this.isAdmin;
      }
      return true;
    });
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeMobileMenu();
  }

  @HostListener('document:click')
  onOutsideClick(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
      this.searchQuery = '';
      this.searchMobileOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.searchMobileOpen = false;
      this.expandedMobileCategory.set(null);
    }
  }

  toggleSearch(): void {
    this.searchMobileOpen = !this.searchMobileOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  openDropdown(name: string): void {
    this.activeDropdown.set(name);
  }

  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  toggleMobileCategory(name: string): void {
    if (this.expandedMobileCategory() === name) {
      this.expandedMobileCategory.set(null);
    } else {
      this.expandedMobileCategory.set(name);
    }
  }

  handleMenuAction(action: string): void {
    if (action === 'logout') {
      this.authService.logout();
      this.closeMobileMenu();
      this.router.navigate(['/']);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}
