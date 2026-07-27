import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartItemDesignUpload } from '../../../core/models/cart.model';
import {
  ProductColor,
  ProductSize,
  ProductFeatureControl,
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

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  imports: [RouterLink, FormsModule, NgClass, ProductCardComponent, LoadingSpinnerComponent],
})
export class ProductDetailComponent implements OnInit {
  readonly ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.pdf', '.ai', '.psd', '.svg'];
  readonly ACCEPTED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'application/pdf',
    'application/postscript',
    'application/illustrator',
    'application/photoshop',
    'image/vnd.adobe.photoshop',
  ];
  readonly MAX_UPLOAD_SIZE_MB = 50;
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
  selectedImageIndex = 0;
  activeTab = signal<string>('description');
  zoomed = signal(false);

  // Service-driven customization data
  featureControl = signal<ProductFeatureControl | null>(null);
  availableColors = signal<ProductColor[]>([]);
  availableSizes = signal<ProductSize[]>([]);
  availableDecorationMethods = signal<DecorationMethod[]>([]);
  availablePrintColors = signal<PrintColor[]>([]);
  priceBreaks = signal<ProductPriceBreak[]>([]);
  productionTime = signal<ProductProductionTime | null>(null);

  // User selections
  selectedSizeId = signal<string | null>(null);
  selectedColorId = signal<string | null>(null);
  selectedDecorationMethodId = signal<string | null>(null);
  selectedPrintColorIds = signal<string[]>([]);
  multipleColors = signal(false);
  customQty = signal(24);
  artworkFileName = signal<string>('');
  artworkFileSize = signal<number>(0);
  artworkFileType = signal<string>('');
  artworkPreviewUrl = signal<string>('');
  artworkUploading = signal(false);
  artworkError = signal<string>('');
  isDragOver = signal(false);
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
    this.customizationService.getFeatureControl(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.featureControl.set(res.data);
    });

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
    if (this.artworkFileName()) {
      designFiles.push({ position: 'artwork', fileName: this.artworkFileName(), fileType: '', fileSize: 0 });
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
      this.artworkFileName(),
      this.estimatedUnitPrice,
    );

    this.quantity = 1;
  }

  get artworkMaxSizeMb(): number {
    return this.featureControl()?.maxFileSizeMb ?? this.MAX_UPLOAD_SIZE_MB;
  }

  get acceptedExtensionsString(): string {
    return this.ACCEPTED_EXTENSIONS.join(', ');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  private processArtworkFile(file: File): void {
    this.artworkError.set('');
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = this.ACCEPTED_EXTENSIONS.includes(ext);
    const isMimeValid = this.ACCEPTED_MIME_TYPES.includes(file.type);

    if (!isExtensionValid && !isMimeValid) {
      this.artworkError.set(`Unsupported file type. Accepted: ${this.acceptedExtensionsString}`);
      return;
    }

    const maxBytes = this.artworkMaxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      this.artworkError.set(`File exceeds ${this.artworkMaxSizeMb}MB limit.`);
      return;
    }

    this.artworkUploading.set(true);

    // Simulate upload delay
    setTimeout(() => {
      const p = this.product();
      if (p) {
        const validation = this.customizationService.validateDesignUpload(file, p.id);
        if (!validation.valid) {
          this.artworkError.set(validation.message);
          this.artworkUploading.set(false);
          return;
        }
      }

      this.artworkFileName.set(file.name);
      this.artworkFileSize.set(file.size);
      this.artworkFileType.set(file.type);
      this.clearValidation();

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.artworkPreviewUrl.set(reader.result as string);
          this.artworkUploading.set(false);
        };
        reader.onerror = () => {
          this.artworkPreviewUrl.set('');
          this.artworkUploading.set(false);
        };
        reader.readAsDataURL(file);
      } else {
        this.artworkPreviewUrl.set('');
        this.artworkUploading.set(false);
      }
    }, 800);
  }

  onArtworkUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.processArtworkFile(file);
    }
    (event.target as HTMLInputElement).value = '';
  }

  onArtworkDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onArtworkDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onArtworkDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processArtworkFile(file);
    }
  }

  removeArtwork(): void {
    this.artworkFileName.set('');
    this.artworkFileSize.set(0);
    this.artworkFileType.set('');
    this.artworkPreviewUrl.set('');
    this.artworkError.set('');
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
