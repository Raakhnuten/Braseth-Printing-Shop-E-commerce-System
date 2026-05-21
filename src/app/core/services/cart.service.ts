import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItem, Cart, CartItemDesignUpload, CartItemPrintColor, CartCustomization } from '../models/cart.model';
import { Product } from '../models/product.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiService } from './api.service';

interface LegacyCartCustomization {
  selectedColors: string[];
  multipleColors: boolean;
  decorationMethod: string;
  frontDesignFileName: string;
  backDesignFileName: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
}

interface LegacyCartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  quantity: number;
  thumbnailUrl: string;
  stockQuantity: number;
  maxQuantity: number;
  customization?: LegacyCartCustomization;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadGuestCartFromLocalStorage());

  readonly items = this.cartItems.asReadonly();

  constructor(private apiService: ApiService) {}

  // ─── LocalStorage helpers ──────────────────────────────

  loadGuestCartFromLocalStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CART);
      if (!stored) return [];

      const parsed: unknown[] = JSON.parse(stored);
      return parsed.map((raw: unknown) => this.normalizeCartItem(raw));
    } catch {
      return [];
    }
  }

  saveGuestCartToLocalStorage(): void {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CART, JSON.stringify(this.cartItems()));
    } catch {
      // Storage unavailable - silently fail
    }
  }

  // ─── Public API ────────────────────────────────────────

  getCart(): Cart {
    return this.calculateCartTotals();
  }

  // TODO: Replace with real API call when backend is ready
  // GET /api/cart
  getCartFromApi(): Observable<ApiResponse<Cart>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of({ success: true, message: 'OK', data: this.getCart() });
    }
    return this.apiService.get<ApiResponse<Cart>>(API_ENDPOINTS.CART.GET);
  }

  addItem(item: CartItem): void {
    this.cartItems.update((items) => [...items, item]);
    this.saveGuestCartToLocalStorage();
  }

  // Convenience: add from Product object (simple, no customization)
  addProductToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cartItems().find(
      (item) => item.productId === product.id && !item.selectedDecorationMethod,
    );

    if (existingItem) {
      this.updateQuantity(product.id, existingItem.quantity + quantity);
      return;
    }

    const newItem: CartItem = {
      id: this.generateItemId(),
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.thumbnailUrl,
      unitPrice: product.salePrice ?? product.price,
      quantity,
      subtotal: (product.salePrice ?? product.price) * quantity,
      selectedSize: null,
      selectedColor: null,
      selectedDecorationMethod: null,
      selectedPrintPosition: null,
      uploadedDesignFiles: [],
      selectedPrintColors: [],
      customizationFee: 0,
      productionTime: null,
      maxQuantity: product.stockQuantity,
      stockQuantity: product.stockQuantity,
      salePrice: product.salePrice,
    };

    this.cartItems.update((items) => [...items, newItem]);
    this.saveGuestCartToLocalStorage();
  }

  // Convenience: add with legacy customization (backward compat)
  // Convenience: add with legacy customization (backward compat)
  addToCart(product: Product, quantity: number = 1, customization?: CartCustomization): void {
    if (customization) {
      this.addProductWithCustomization(
        product,
        customization.quantity,
        customization.selectedColors,
        customization.decorationMethod,
        customization.frontDesignFileName,
        customization.backDesignFileName,
        customization.estimatedUnitPrice,
      );
      return;
    }
    this.addProductToCart(product, quantity);
  }

  addProductWithCustomization(
    product: Product,
    quantity: number,
    selectedColors: string[],
    decorationMethod: string,
    frontDesignFileName: string,
    backDesignFileName: string,
    estimatedUnitPrice: number,
  ): void {
    const designFiles: CartItemDesignUpload[] = [];
    if (frontDesignFileName) {
      designFiles.push({ position: 'front', fileName: frontDesignFileName, fileType: '', fileSize: 0 });
    }
    if (backDesignFileName) {
      designFiles.push({ position: 'back', fileName: backDesignFileName, fileType: '', fileSize: 0 });
    }

    const printColors: CartItemPrintColor[] = selectedColors.map((name) => ({
      colorId: name.toLowerCase(),
      colorName: name,
      colorHex: '#000000',
    }));

    const newItem: CartItem = {
      id: this.generateItemId(),
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.thumbnailUrl,
      unitPrice: estimatedUnitPrice,
      quantity,
      subtotal: estimatedUnitPrice * quantity,
      selectedSize: null,
      selectedColor: selectedColors.length > 0 ? selectedColors.join(', ') : null,
      selectedDecorationMethod: decorationMethod,
      selectedPrintPosition: null,
      uploadedDesignFiles: designFiles,
      selectedPrintColors: printColors,
      customizationFee: estimatedUnitPrice - (product.salePrice ?? product.price),
      productionTime: null,
      maxQuantity: quantity,
      stockQuantity: product.stockQuantity,
      salePrice: product.salePrice,
    };

    this.cartItems.update((items) => [...items, newItem]);
    this.saveGuestCartToLocalStorage();
  }

  // TODO: POST /api/cart/add
  addToCartApi(productId: string, quantity: number = 1): Observable<ApiResponse<Cart>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      this.addProductToCart(
        { id: productId, name: '', slug: '', description: '', price: 0, salePrice: null, stockQuantity: 0, sku: '', thumbnailUrl: '', images: [], featured: false, enabled: false, status: 'DRAFT' as any, categoryId: '', categoryName: '', allowReview: false, allowCoupon: false, allowCart: false, allowCheckout: false, createdAt: '', updatedAt: '' },
        quantity,
      );
      return of({ success: true, message: 'OK', data: this.getCart() });
    }
    return this.apiService.post<ApiResponse<Cart>>(API_ENDPOINTS.CART.ADD, { productId, quantity });
  }

  updateItem(itemId: string, updates: Partial<CartItem>): void {
    this.cartItems.update((items) =>
      items.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates };
          updated.subtotal = updated.unitPrice * updated.quantity;
          return updated;
        }
        return item;
      }),
    );
    this.saveGuestCartToLocalStorage();
  }

  // TODO: POST /api/cart/update
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.cartItems.update((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.stockQuantity), subtotal: item.unitPrice * Math.min(quantity, item.stockQuantity) }
          : item,
      ),
    );
    this.saveGuestCartToLocalStorage();
  }

  // TODO: POST /api/cart/update
  updateQuantityApi(productId: string, quantity: number): Observable<ApiResponse<Cart>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      this.updateQuantity(productId, quantity);
      return of({ success: true, message: 'OK', data: this.getCart() });
    }
    return this.apiService.post<ApiResponse<Cart>>(API_ENDPOINTS.CART.UPDATE, { productId, quantity });
  }

  removeItem(identifier: string): void {
    this.cartItems.update((items) => items.filter((item) => item.id !== identifier && item.productId !== identifier));
    this.saveGuestCartToLocalStorage();
  }

  // TODO: DELETE /api/cart/remove/:id
  removeFromCartApi(productId: string): Observable<ApiResponse<Cart>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      this.removeItem(productId);
      return of({ success: true, message: 'OK', data: this.getCart() });
    }
    return this.apiService.delete<ApiResponse<Cart>>(API_ENDPOINTS.CART.REMOVE + '/' + productId);
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveGuestCartToLocalStorage();
  }

  // TODO: DELETE /api/cart/clear
  clearCartApi(): Observable<ApiResponse<void>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      this.clearCart();
      return of({ success: true, message: 'Cart cleared', data: undefined });
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.CART.CLEAR);
  }

  // Sync guest cart to server after login
  // TODO: POST /api/cart/sync
  syncGuestCart(): Observable<ApiResponse<Cart>> {
    const guestItems = this.cartItems();
    if (guestItems.length === 0) {
      return of({ success: true, message: 'No guest cart to sync', data: this.getCart() });
    }
    // When backend is ready, send guest cart items to merge with server cart
    return this.apiService.post<ApiResponse<Cart>>(API_ENDPOINTS.CART.SYNC, { items: guestItems });
  }

  getCartItemCount(): number {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  isInCart(productId: string): boolean {
    return this.cartItems().some((item) => item.productId === productId);
  }

  calculateCartTotals(): Cart {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const customizationFeeTotal = items.reduce((sum, item) => sum + (item.customizationFee || 0) * item.quantity, 0);
    const discount = 0; // TODO: integrate coupon service
    const shippingFee = subtotal > 100 ? 0 : 9.99; // TODO: integrate shipping service
    const total = subtotal + customizationFeeTotal - discount + shippingFee;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      customizationFeeTotal,
      discount,
      shippingFee,
      total,
      totalItems,
    };
  }

  // ─── Private helpers ───────────────────────────────────

  private generateItemId(): string {
    return 'cart-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
  }

  private normalizeCartItem(raw: unknown): CartItem {
    const r = raw as Record<string, unknown>;

    // New format: already has `id`
    if (r['id']) {
      return {
        id: String(r['id']),
        productId: String(r['productId'] ?? ''),
        productName: String(r['productName'] ?? r['name'] ?? ''),
        productSlug: String(r['productSlug'] ?? r['slug'] ?? ''),
        productImage: String(r['productImage'] ?? r['thumbnailUrl'] ?? ''),
        unitPrice: Number(r['unitPrice'] ?? r['price'] ?? 0),
        quantity: Number(r['quantity'] ?? 1),
        subtotal: Number(r['subtotal'] ?? 0),
        selectedSize: (r['selectedSize'] as string) ?? null,
        selectedColor: (r['selectedColor'] as string) ?? null,
        selectedDecorationMethod: (r['selectedDecorationMethod'] as string) ?? null,
        selectedPrintPosition: (r['selectedPrintPosition'] as string) ?? null,
        uploadedDesignFiles: Array.isArray(r['uploadedDesignFiles']) ? (r['uploadedDesignFiles'] as CartItemDesignUpload[]) : [],
        selectedPrintColors: Array.isArray(r['selectedPrintColors']) ? (r['selectedPrintColors'] as CartItemPrintColor[]) : [],
        customizationFee: Number(r['customizationFee'] ?? 0),
        productionTime: (r['productionTime'] as number) ?? null,
        maxQuantity: Number(r['maxQuantity'] ?? 999),
        stockQuantity: Number(r['stockQuantity'] ?? 0),
        salePrice: (r['salePrice'] as number) ?? null,
      };
    }

    // Legacy format: migrate from old CartCustomization structure
    const customization = r['customization'] as LegacyCartCustomization | undefined;
    const designFiles: CartItemDesignUpload[] = [];
    if (customization?.frontDesignFileName) {
      designFiles.push({ position: 'front', fileName: customization.frontDesignFileName, fileType: '', fileSize: 0 });
    }
    if (customization?.backDesignFileName) {
      designFiles.push({ position: 'back', fileName: customization.backDesignFileName, fileType: '', fileSize: 0 });
    }

    const printColors: CartItemPrintColor[] = (customization?.selectedColors ?? []).map((name: string) => ({
      colorId: name.toLowerCase(),
      colorName: name,
      colorHex: '#000000',
    }));

    const price = Number(r['price'] ?? 0);
    const qty = Number(r['quantity'] ?? 1);

    return {
      id: this.generateItemId(),
      productId: String(r['productId'] ?? ''),
      productName: String(r['name'] ?? ''),
      productSlug: String(r['slug'] ?? ''),
      productImage: String(r['thumbnailUrl'] ?? ''),
      unitPrice: customization?.estimatedUnitPrice ?? price,
      quantity: qty,
      subtotal: customization?.estimatedTotal ?? price * qty,
      selectedSize: null,
      selectedColor: customization?.selectedColors?.join(', ') ?? null,
      selectedDecorationMethod: customization?.decorationMethod ?? null,
      selectedPrintPosition: null,
      uploadedDesignFiles: designFiles,
      selectedPrintColors: printColors,
      customizationFee: customization ? customization.estimatedUnitPrice - price : 0,
      productionTime: null,
      maxQuantity: Number(r['maxQuantity'] ?? 999),
      stockQuantity: Number(r['stockQuantity'] ?? 0),
      salePrice: (r['salePrice'] as number) ?? null,
    };
  }
}
