import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartItemDesignUpload } from '../../../core/models/cart.model';
import {
  ProductColor,
  ProductSize,
  ProductPriceBreak,
  ProductProductionTime,
  DecorationMethod,
  PrintColor,
} from '../../../core/models/customization.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductVariantService } from '../../../core/services/product-variant.service';
import { ProductCustomizationService, CustomizationTotal } from '../../../core/services/product-customization.service';
import { DecorationMethodService } from '../../../core/services/decoration-method.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ProductGalleryComponent } from './components/product-gallery/product-gallery.component';
import { ProductCustomizationComponent } from './components/product-customization/product-customization.component';
import { DesignUploadComponent, DesignFileUpload } from './components/design-upload/design-upload.component';
import { ProductPricingComponent } from './components/product-pricing/product-pricing.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  imports: [
    RouterLink,
    NgClass,
    ProductCardComponent,
    LoadingSpinnerComponent,
    ProductGalleryComponent,
    ProductCustomizationComponent,
    DesignUploadComponent,
    ProductPricingComponent,
  ],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private variantService = inject(ProductVariantService);
  private customizationService = inject(ProductCustomizationService);
  private decorationService = inject(DecorationMethodService);
  private destroyRef = inject(DestroyRef);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal(true);
  quantity = 1;
  activeTab = signal<string>('description');

  // Service-driven customization data
  availableColors = signal<ProductColor[]>([]);
  availableSizes = signal<ProductSize[]>([]);
  availableDecorationMethods = signal<DecorationMethod[]>([]);
  availablePrintColors = signal<PrintColor[]>([]);
  priceBreaks = signal<ProductPriceBreak[]>([]);
  productionTime = signal<ProductProductionTime | null>(null);

  // User selections (updated by child components)
  selectedSizeId = signal<string | null>(null);
  selectedColorId = signal<string | null>(null);
  selectedDecorationMethodId = signal<string | null>(null);
  selectedPrintColorIds = signal<string[]>([]);
  multipleColors = signal(false);
  customQty = signal(24);
  artworkFileName = signal<string>('');

  // Validation
  validationErrors = signal<string[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productService.getProductById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      const p = res.data;
      this.product.set(p);
      this.loading.set(false);
      if (p) {
        this.loadRelatedProducts(p.categoryId, p.id);
        this.loadCustomizationData(p.id);
      }
    });
  }

  private loadCustomizationData(productId: string): void {
    this.customizationService.getPriceBreaks(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.priceBreaks.set(res.data.filter((b) => b.isActive).sort((a, b) => a.minQuantity - b.minQuantity));
    });

    this.customizationService.getProductionTime(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.productionTime.set(res.data);
    });

    this.decorationService.getDecorationMethodsByProductId(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.availableDecorationMethods.set(res.data.sort((a, b) => a.sortOrder - b.sortOrder));
    });

    this.variantService.getAvailableColorsWithDetails(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.availableColors.set(res.data);
    });

    this.variantService.getAvailableSizesWithDetails(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.availableSizes.set(res.data);
    });

    this.customizationService.getPrintColors(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.availablePrintColors.set(res.data);
    });
  }

  private loadRelatedProducts(categoryId: string, excludeId: string): void {
    this.productService.getProductsByCategory(categoryId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.relatedProducts.set((res.data || []).filter((p) => p.id !== excludeId).slice(0, 4));
    });
  }

  // ─── Product info ──────────────────────────────────────
  get inStock(): boolean {
    return this.product()?.stockQuantity ? this.product()!.stockQuantity > 0 : false;
  }

  get stockLabel(): string {
    const p = this.product();
    if (!p) return '';
    if (p.stockQuantity > 20) return 'In Stock';
    if (p.stockQuantity > 0) return 'Only ' + p.stockQuantity + ' left';
    return 'Out of Stock';
  }

  get discountPercent(): string {
    const p = this.product();
    if (!p || !p.salePrice) return '';
    return '-' + Math.round((1 - p.salePrice / p.price) * 100) + '%';
  }

  get isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product()?.id ?? '');
  }

  toggleWishlist(): void {
    const id = this.product()?.id;
    if (!id) return;
    if (this.isInWishlist) this.wishlistService.removeFromWishlist(id);
    else this.wishlistService.addToWishlist(id);
  }

  shareProduct(): void {
    if (navigator.share) {
      navigator.share({ title: this.product()?.name, url: window.location.href });
    }
  }

  get fullStars(): number[] {
    const r = this.product()?.rating ?? 0;
    return Array.from({ length: Math.floor(r) }, (_, i) => i);
  }
  get hasHalfStar(): boolean {
    const r = this.product()?.rating ?? 0;
    return r - Math.floor(r) >= 0.5;
  }
  get emptyStars(): number[] {
    const r = this.product()?.rating ?? 0;
    return Array.from({ length: 5 - Math.ceil(r) }, (_, i) => i);
  }

  // ─── Customization helpers ──────────────────────────────
  get isCustomizable(): boolean {
    return true;
  }

  get artworkMaxSizeMb(): number {
    return 50;
  }

  // ─── Child component event handlers ────────────────────
  onSizeSelected(sizeId: string): void {
    this.selectedSizeId.set(sizeId);
    this.clearValidation();
  }

  onColorSelected(colorId: string): void {
    this.selectedColorId.set(colorId || null);
    this.clearValidation();
  }

  onDecorationSelected(methodId: string): void {
    this.selectedDecorationMethodId.set(methodId);
    this.clearValidation();
  }

  onPrintColorsSelected(colorIds: string[]): void {
    this.selectedPrintColorIds.set(colorIds);
    this.clearValidation();
  }

  onMultipleColorsChanged(val: boolean): void {
    this.multipleColors.set(val);
  }

  onQuantityChanged(qty: number): void {
    this.customQty.set(qty);
  }

  onFileUploaded(file: DesignFileUpload): void {
    this.artworkFileName.set(file.fileName);
    this.clearValidation();
  }

  onFileRemoved(): void {
    this.artworkFileName.set('');
  }

  // ─── Price calculation ─────────────────────────────────
  get basePrice(): number {
    const p = this.product();
    return p ? (p.salePrice ?? p.price) : 0;
  }

  get selectedDecorationMethod(): DecorationMethod | undefined {
    const id = this.selectedDecorationMethodId();
    return id ? this.availableDecorationMethods().find((m) => m.id === id) : undefined;
  }

  get customizationSummary(): CustomizationTotal | null {
    const p = this.product();
    if (!p) return null;

    const decorationFee = this.selectedDecorationMethod?.baseFee ?? 0;

    return this.customizationService.calculateCustomizationTotal({
      productId: p.id,
      quantity: this.customQty(),
      decorationMethodId: this.selectedDecorationMethodId(),
      printPositionId: null,
      printColorIds: this.selectedPrintColorIds(),
      isMultipleColors: this.multipleColors(),
    }, this.basePrice, decorationFee, 0);
  }

  get estimatedUnitPrice(): number {
    return this.customizationSummary?.unitPrice ?? this.basePrice;
  }

  // ─── Validation ────────────────────────────────────────
  validateCustomization(): string[] {
    const errors: string[] = [];

    if (this.availableSizes().length > 0 && !this.selectedSizeId()) {
      errors.push('Please select a size.');
    }
    if (this.availableColors().length > 0 && !this.selectedColorId()) {
      errors.push('Please select a color.');
    }
    if (this.availableDecorationMethods().length > 0 && !this.selectedDecorationMethodId()) {
      errors.push('Please select a decoration method.');
    }
    const minQty = this.priceBreaks().length > 0 ? this.priceBreaks()[0].minQuantity : 1;
    if (this.customQty() < minQty) {
      errors.push(`Minimum order quantity is ${minQty}.`);
    }
    return errors;
  }

  clearValidation(): void {
    this.validationErrors.set([]);
  }

  // ─── Add to cart ───────────────────────────────────────
  addToCart(): void {
    const p = this.product();
    if (!p) return;

    if (this.isCustomizable) {
      const errors = this.validateCustomization();
      if (errors.length > 0) {
        this.validationErrors.set(errors);
        return;
      }
    }

    const selectedColor = this.selectedColorId() ? this.availableColors().find((c) => c.id === this.selectedColorId()) : null;
    const qty = this.isCustomizable ? this.customQty() : this.quantity;

    this.cartService.addProductWithCustomization(
      p,
      qty,
      selectedColor ? [selectedColor.name] : [],
      this.selectedDecorationMethod?.name ?? '',
      this.artworkFileName(),
      this.estimatedUnitPrice,
    );

    this.quantity = 1;
  }
}
