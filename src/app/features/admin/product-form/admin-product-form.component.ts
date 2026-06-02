import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { ProductStatus } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-product-form',
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss',
  imports: [PageHeaderComponent, ReactiveFormsModule, RouterLink],
})
export class AdminProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  protected readonly ProductStatus = ProductStatus;

  categories = signal<Category[]>([]);
  loading = signal(false);
  submitted = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  productId = signal<string | null>(null);
  isEditMode = computed(() => !!this.productId());

  form = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    salePrice: [null as number | null, [Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    sku: ['', Validators.required],
    thumbnailUrl: ['', Validators.required],
    categoryId: ['', Validators.required],
    status: ['', Validators.required],
    featured: [false],
    enabled: [true],
    allowCart: [true],
    allowCheckout: [true],
    allowCoupon: [true],
    allowReview: [true],
  });

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  private loadCategories(): void {
    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => this.categories.set(res.data),
    });
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productService.getProductById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const product = res.data;
        if (product) {
          this.form.patchValue({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            salePrice: product.salePrice,
            stockQuantity: product.stockQuantity,
            sku: product.sku,
            thumbnailUrl: product.thumbnailUrl,
            categoryId: product.categoryId,
            status: product.status,
            featured: product.featured,
            enabled: product.enabled,
            allowCart: product.allowCart,
            allowCheckout: product.allowCheckout,
            allowCoupon: product.allowCoupon,
            allowReview: product.allowReview,
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load product.');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.form.invalid) return;

    const formValue = this.form.value as any;

    if (this.isEditMode()) {
      this.productService.updateProduct(this.productId()!, formValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.successMessage.set('Product updated successfully.');
          setTimeout(() => this.router.navigate(['/admin/products']), 1500);
        },
        error: () => this.errorMessage.set('Failed to update product.'),
      });
    } else {
      this.productService.createProduct(formValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.successMessage.set('Product created successfully.');
          setTimeout(() => this.router.navigate(['/admin/products']), 1500);
        },
        error: () => this.errorMessage.set('Failed to create product.'),
      });
    }
  }
}
