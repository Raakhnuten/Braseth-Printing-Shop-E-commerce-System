import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

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

const NAV_CATEGORIES: NavCategory[] = [
  {
    name: 'Men',
    route: '/products',
    subcategories: [
      { name: 'T-Shirts', route: '/products' },
      { name: 'Shirts', route: '/products' },
      { name: 'Pants', route: '/products' },
      { name: 'Shoes', route: '/products' },
      { name: 'Accessories', route: '/products' },
    ],
    featured: [
      { label: 'New Collection', route: '/products' },
      { label: 'Summer Sale', route: '/products' },
    ],
  },
  {
    name: 'Women',
    route: '/products',
    subcategories: [
      { name: 'Dresses', route: '/products' },
      { name: 'Tops', route: '/products' },
      { name: 'Skirts', route: '/products' },
      { name: 'Shoes', route: '/products' },
      { name: 'Bags', route: '/products' },
    ],
    featured: [
      { label: 'Trending Now', route: '/products' },
      { label: 'New Arrivals', route: '/products' },
    ],
  },
  {
    name: 'Kids',
    route: '/products',
    subcategories: [
      { name: 'Boys Clothing', route: '/products' },
      { name: 'Girls Clothing', route: '/products' },
      { name: 'Shoes', route: '/products' },
      { name: 'Toys', route: '/products' },
      { name: 'School Bags', route: '/products' },
    ],
  },
  {
    name: 'Electronics',
    route: '/products',
    subcategories: [
      { name: 'Phones', route: '/products' },
      { name: 'Laptops', route: '/products' },
      { name: 'Headphones', route: '/products' },
      { name: 'Cameras', route: '/products' },
      { name: 'Gaming', route: '/products' },
    ],
  },
  {
    name: 'Home & Living',
    route: '/products',
    subcategories: [
      { name: 'Furniture', route: '/products' },
      { name: 'Kitchen', route: '/products' },
      { name: 'Bedding', route: '/products' },
      { name: 'Decor', route: '/products' },
      { name: 'Storage', route: '/products' },
    ],
  },
  {
    name: 'Beauty',
    route: '/products',
    subcategories: [
      { name: 'Makeup', route: '/products' },
      { name: 'Skincare', route: '/products' },
      { name: 'Hair Care', route: '/products' },
      { name: 'Fragrance', route: '/products' },
      { name: 'Tools', route: '/products' },
    ],
  },
  {
    name: 'Sports',
    route: '/products',
    subcategories: [
      { name: 'Sportswear', route: '/products' },
      { name: 'Shoes', route: '/products' },
      { name: 'Gym Equipment', route: '/products' },
      { name: 'Outdoor', route: '/products' },
      { name: 'Football', route: '/products' },
    ],
  },
  {
    name: 'More',
    route: '/products',
    isMore: true,
    subcategories: [
      { name: 'New Arrivals', route: '/products' },
      { name: 'Best Sellers', route: '/products' },
      { name: 'Sale', route: '/products' },
      { name: 'Brands', route: '/products' },
      { name: 'Gift Cards', route: '/products' },
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

  readonly navCategories = NAV_CATEGORIES;

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

  onLogout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}
