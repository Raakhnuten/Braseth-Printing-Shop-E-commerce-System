import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { ProductService } from './product.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private wishlistIds = signal<string[]>(this.loadFromStorage());

  readonly items = this.wishlistIds.asReadonly();

  constructor(
    private http: HttpClient,
    private productService: ProductService,
  ) {}

  private loadFromStorage(): string[] {
    try {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.WISHLIST);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.WISHLIST, JSON.stringify(this.wishlistIds()));
    } catch {
      // Storage unavailable
    }
  }

  getWishlistProducts(): Observable<ApiResponse<Product[]>> {
    const ids = this.wishlistIds();
    if (!ids.length) {
      return of({ success: true, message: 'OK', data: [] });
    }
    return this.productService
      .getProducts()
      .pipe(
        map((res) => ({
          ...res,
          data: (res.data || []).filter((p) => ids.includes(p.id)),
        })),
      );
  }

  addToWishlist(productId: string): void {
    if (this.wishlistIds().includes(productId)) return;
    this.wishlistIds.update((ids) => [...ids, productId]);
    this.saveToStorage();
  }

  removeFromWishlist(productId: string): void {
    this.wishlistIds.update((ids) => ids.filter((id) => id !== productId));
    this.saveToStorage();
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistIds().includes(productId);
  }

  clearWishlist(): void {
    this.wishlistIds.set([]);
    this.saveToStorage();
  }

  getCount(): number {
    return this.wishlistIds().length;
  }
}
