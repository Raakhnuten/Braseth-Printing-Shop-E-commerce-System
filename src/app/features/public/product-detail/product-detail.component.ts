import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartItemDesignUpload } from '../../../core/models/cart.model';
import {
  ProductColor,
  ProductSize,
  ProductFeatureControl,
  ProductPrintPosition,
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
import { normalizeImages, getSafeImageUrl, onImageError } from '../../../core/helpers/image.helper';
import { MOCK_PRODUCT_COLORS } from '../../../mock-data/mock-product-colors';
import { MOCK_PRODUCT_SIZES } from '../../../mock-data/mock-product-sizes';
import { MOCK_PRINT_COLORS } from '../../../mock-data/mock-print-colors';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  imports: [RouterLink, FormsModule, NgClass, ProductCardComponent, LoadingSpinnerComponent],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private variantService = inject(ProductVariantService);
  private customizationService = inject(ProductCustomizationService);
  private decorationService = inject(DecorationMethodService);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal(true);
  quantity = 1;
  selectedImageIndex = 0;
  activeTab = signal<string>('description');
  zoomed = signal(false);

  // Service-driven customization data
  featureControl = signal<ProductFeatureControl | null>(null);
  availableColors = signal<ProductColor[]>([]);
  availableSizes = signal<ProductSize[]>([]);
  availableDecorationMethods = signal<DecorationMethod[]>([]);
  availablePrintPositions = signal<ProductPrintPosition[]>([]);
  availablePrintColors = signal<PrintColor[]>([]);
  priceBreaks = signal<ProductPriceBreak[]>([]);
  productionTime = signal<ProductProductionTime | null>(null);

  // User selections
  selectedSizeId = signal<string | null>(null);
  selectedColorId = signal<string | null>(null);
  selectedDecorationMethodId = signal<string | null>(null);
  selectedPrintPositionId = signal<string | null>(null);
  selectedPrintColorIds = signal<string[]>([]);
  multipleColors = signal(false);
  customQty = signal(24);
  frontDesignFileName = signal<string>('');
  backDesignFileName = signal<string>('');
  showPriceBreaks = signal(false);
  isCustomOrder = signal(false);

  // Validation
  validationErrors = signal<string[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe((res) => {
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
    this.customizationService.getFeatureControl(productId).subscribe((res) => {
      this.featureControl.set(res.data);
    });

    this.customizationService.getPriceBreaks(productId).subscribe((res) => {
      this.priceBreaks.set(res.data.filter((b) => b.isActive).sort((a, b) => a.minQuantity - b.minQuantity));
    });

    this.customizationService.getProductionTime(productId).subscribe((res) => {
      this.productionTime.set(res.data);
    });

    this.customizationService.getPrintPositions(productId).subscribe((res) => {
      this.availablePrintPositions.set(res.data.filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
    });

    this.decorationService.getDecorationMethodsByProductId(productId).subscribe((res) => {
      this.availableDecorationMethods.set(res.data.sort((a, b) => a.sortOrder - b.sortOrder));
    });

    this.variantService.getAvailableColors(productId).subscribe((res) => {
      const colorIds = res.data;
      this.availableColors.set(MOCK_PRODUCT_COLORS.filter((c) => colorIds.includes(c.id) && c.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
    });

    this.variantService.getAvailableSizes(productId).subscribe((res) => {
      const sizeIds = res.data;
      this.availableSizes.set(MOCK_PRODUCT_SIZES.filter((s) => sizeIds.includes(s.id) && s.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
    });

    this.availablePrintColors.set(MOCK_PRINT_COLORS);
  }

  private loadRelatedProducts(categoryId: string, excludeId: string): void {
    this.productService.getProductsByCategory(categoryId).subscribe((res) => {
      this.relatedProducts.set((res.data || []).filter((p) => p.id !== excludeId).slice(0, 4));
    });
  }

  // ─── Image gallery ─────────────────────────────────────
  get validImages(): string[] {
    const p = this.product();
    if (!p) return [];
    const cleaned = normalizeImages(p.images);
    const all = [getSafeImageUrl(p.thumbnailUrl), ...cleaned];
    return [...new Set(all)];
  }

  onImgError(event: Event): void { onImageError(event); }
  selectImage(index: number): void { this.selectedImageIndex = index; }

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

  // ─── Feature control helpers ───────────────────────────
  get isCustomizable(): boolean {
    return this.featureControl()?.isCustomizable ?? false;
  }

  get enableSizeSelection(): boolean {
    return this.featureControl()?.enableSizeSelection ?? false;
  }

  get enableColorSelection(): boolean {
    return this.featureControl()?.enableColorSelection ?? false;
  }

  get enableDecorationMethod(): boolean {
    return this.featureControl()?.enableDecorationMethod ?? false;
  }

  get enablePrintPosition(): boolean {
    return this.featureControl()?.enablePrintPosition ?? false;
  }

  get enablePrintColor(): boolean {
    return this.featureControl()?.enablePrintColor ?? false;
  }

  get enableDesignUpload(): boolean {
    return this.featureControl()?.enableDesignUpload ?? false;
  }

  get enablePriceBreak(): boolean {
    return this.featureControl()?.enablePriceBreak ?? false;
  }

  get enableProductionTime(): boolean {
    return this.featureControl()?.enableProductionTime ?? false;
  }

  get enableCustomizationFee(): boolean {
    return this.featureControl()?.enableCustomizationFee ?? false;
  }

  get maxUploadFiles(): number {
    return this.featureControl()?.maxUploadFiles ?? 2;
  }

  // ─── Selection handlers ────────────────────────────────
  selectSize(sizeId: string): void {
    this.selectedSizeId.set(sizeId);
    this.clearValidation();
  }

  selectColor(colorId: string): void {
    const cur = this.selectedColorId();
    this.selectedColorId.set(cur === colorId ? null : colorId);
    this.clearValidation();
  }

  selectDecoration(methodId: string): void {
    this.selectedDecorationMethodId.set(methodId);
    this.clearValidation();
  }

  selectPrintPosition(positionId: string): void {
    this.selectedPrintPositionId.set(positionId);
    this.clearValidation();
  }

  togglePrintColor(colorId: string): void {
    const cur = this.selectedPrintColorIds();
    if (cur.includes(colorId)) {
      this.selectedPrintColorIds.set(cur.filter((c) => c !== colorId));
    } else {
      this.selectedPrintColorIds.set([...cur, colorId]);
    }
    this.clearValidation();
  }

  toggleMultipleColors(): void {
    this.multipleColors.set(!this.multipleColors());
  }

  adjustQty(delta: number): void {
    const fc = this.featureControl();
    const minQty = this.enablePriceBreak && this.priceBreaks().length > 0 ? this.priceBreaks()[0].minQuantity : 1;
    const n = this.customQty() + delta;
    if (n >= minQty) this.customQty.set(n);
  }

  setQty(value: number): void {
    const minQty = this.enablePriceBreak && this.priceBreaks().length > 0 ? this.priceBreaks()[0].minQuantity : 1;
    this.customQty.set(value < minQty ? minQty : value);
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

  get selectedPrintPosition(): ProductPrintPosition | undefined {
    const id = this.selectedPrintPositionId();
    return id ? this.availablePrintPositions().find((p) => p.id === id) : undefined;
  }

  get customizationSummary(): CustomizationTotal | null {
    const p = this.product();
    if (!p) return null;

    const decorationFee = this.selectedDecorationMethod?.baseFee ?? 0;
    const positionFee = this.selectedPrintPosition?.extraFee ?? 0;

    return this.customizationService.calculateCustomizationTotal({
      productId: p.id,
      quantity: this.customQty(),
      decorationMethodId: this.selectedDecorationMethodId(),
      printPositionId: this.selectedPrintPositionId(),
      printColorIds: this.selectedPrintColorIds(),
      isMultipleColors: this.multipleColors(),
    }, this.basePrice, decorationFee, positionFee);
  }

  get estimatedUnitPrice(): number {
    return this.customizationSummary?.unitPrice ?? this.basePrice;
  }

  get estimatedTotal(): number {
    return this.customizationSummary?.totalPrice ?? this.basePrice * this.customQty();
  }

  get productionDays(): number {
    return this.customizationSummary?.productionDays ?? this.productionTime()?.maxDays ?? 0;
  }

  get minOrderQuantity(): number {
    if (this.enablePriceBreak && this.priceBreaks().length > 0) {
      return this.priceBreaks()[0].minQuantity;
    }
    return 1;
  }

  // ─── Validation ────────────────────────────────────────
  validateCustomization(): string[] {
    const errors: string[] = [];
    const fc = this.featureControl();
    if (!fc || !fc.isCustomizable) return errors;

    if (fc.enableSizeSelection && !this.selectedSizeId()) {
      errors.push('Please select a size.');
    }
    if (fc.enableColorSelection && !this.selectedColorId()) {
      errors.push('Please select a color.');
    }
    if (fc.enableDecorationMethod && !this.selectedDecorationMethodId()) {
      errors.push('Please select a decoration method.');
    }
    if (this.customQty() < this.minOrderQuantity) {
      errors.push(`Minimum order quantity is ${this.minOrderQuantity}.`);
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

    const designFiles: CartItemDesignUpload[] = [];
    if (this.frontDesignFileName()) {
      designFiles.push({ position: 'front', fileName: this.frontDesignFileName(), fileType: '', fileSize: 0 });
    }
    if (this.backDesignFileName()) {
      designFiles.push({ position: 'back', fileName: this.backDesignFileName(), fileType: '', fileSize: 0 });
    }

    const selectedColor = this.selectedColorId() ? this.availableColors().find((c) => c.id === this.selectedColorId()) : null;
    const selectedSize = this.selectedSizeId() ? this.availableSizes().find((s) => s.id === this.selectedSizeId()) : null;

    const customizationFee = this.customizationSummary ? (this.customizationSummary.decorationFee + this.customizationSummary.positionFee + this.customizationSummary.multiColorFee + this.customizationSummary.customizationFees) : 0;
    const qty = this.isCustomizable ? this.customQty() : this.quantity;

    this.cartService.addProductWithCustomization(
      p,
      qty,
      selectedColor ? [selectedColor.name] : [],
      this.selectedDecorationMethod?.name ?? '',
      this.frontDesignFileName(),
      this.backDesignFileName(),
      this.estimatedUnitPrice,
    );

    this.quantity = 1;
  }

  onFrontDesignUpload(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) {
      const p = this.product();
      if (p) {
        const validation = this.customizationService.validateDesignUpload(f, p.id);
        if (validation.valid) {
          this.frontDesignFileName.set(f.name);
        } else {
          this.validationErrors.set([validation.message]);
        }
      }
    }
  }

  onBackDesignUpload(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) {
      const p = this.product();
      if (p) {
        const validation = this.customizationService.validateDesignUpload(f, p.id);
        if (validation.valid) {
          this.backDesignFileName.set(f.name);
        } else {
          this.validationErrors.set([validation.message]);
        }
      }
    }
  }

  downloadTemplate(): void {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#f8f9fa"/>
  <rect x="50" y="50" width="500" height="500" rx="20" fill="#fff" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,4"/>
  <text x="300" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#9ca3af">Design Area</text>
  <text x="300" y="310" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#9ca3af">600 x 600 px</text>
  <line x1="50" y1="200" x2="550" y2="200" stroke="#e5e7eb" stroke-width="1"/>
  <line x1="50" y1="400" x2="550" y2="400" stroke="#e5e7eb" stroke-width="1"/>
  <line x1="200" y1="50" x2="200" y2="550" stroke="#e5e7eb" stroke-width="1"/>
  <line x1="400" y1="50" x2="400" y2="550" stroke="#e5e7eb" stroke-width="1"/>
  <circle cx="300" cy="300" r="120" fill="none" stroke="#e5e7eb" stroke-width="1"/>
  <text x="300" y="580" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#d1d5db">Center alignment guide</text>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-template.svg';
    a.click();
    URL.revokeObjectURL(url);
  }
}
