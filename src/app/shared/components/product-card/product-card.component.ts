import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { getSafeImageUrl, onImageError } from '../../../core/helpers/image.helper';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  imports: [RouterLink, NgClass],
})
export class ProductCardComponent {
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);

  @Input() product!: Product;

  get displayPrice(): string {
    if (this.product.salePrice) {
      return `$${this.product.salePrice.toFixed(2)}`;
    }
    return `$${this.product.price.toFixed(2)}`;
  }

  get hasSale(): boolean {
    return this.product.salePrice !== null && this.product.salePrice < this.product.price;
  }

  get originalPrice(): string {
    return `$${this.product.price.toFixed(2)}`;
  }

  get imageUrl(): string {
    return getSafeImageUrl(this.product.thumbnailUrl);
  }

  onImgError(event: Event): void {
    onImageError(event);
  }

  get inStock(): boolean {
    return this.product.stockQuantity > 0;
  }

  get stockLabel(): string {
    if (this.product.stockQuantity > 20) return 'In Stock';
    if (this.product.stockQuantity > 0) return 'Only ' + this.product.stockQuantity + ' left';
    return 'Out of Stock';
  }

  get stockBadgeClass(): string {
    if (this.product.stockQuantity > 20) return 'badge-success';
    if (this.product.stockQuantity > 0) return 'badge-warning';
    return 'badge-danger';
  }

  get discountPercent(): string {
    if (!this.hasSale || !this.product.salePrice) return '';
    const pct = Math.round((1 - this.product.salePrice / this.product.price) * 100);
    return '-' + pct + '%';
  }

  get isNew(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(this.product.createdAt) > thirtyDaysAgo;
  }

  get cardBadges(): { label: string; type: string }[] {
    const badges: { label: string; type: string }[] = [];
    if (this.hasSale) {
      badges.push({ label: this.discountPercent, type: 'sale' });
    }
    if (this.isNew) {
      badges.push({ label: 'New', type: 'new' });
    }
    if (this.product.featured && !this.hasSale) {
      badges.push({ label: 'Best Seller', type: 'featured' });
    }
    return badges.slice(0, 2);
  }

  get fullStars(): number[] {
    const rating = this.product.rating ?? 0;
    return Array.from({ length: Math.floor(rating) }, (_, i) => i);
  }

  get hasHalfStar(): boolean {
    const rating = this.product.rating ?? 0;
    return rating - Math.floor(rating) >= 0.5;
  }

  get emptyStars(): number[] {
    const rating = this.product.rating ?? 0;
    const total = 5;
    const filled = Math.ceil(rating);
    return Array.from({ length: total - filled }, (_, i) => i);
  }

  get isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product.id);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    if (this.inStock && this.product.allowCart) {
      this.cartService.addToCart(this.product);
    }
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id);
    } else {
      this.wishlistService.addToWishlist(this.product.id);
    }
  }
}
