import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, ProductStatus } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    RouterLink,
    FormsModule,
  ],
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  protected readonly ProductStatus = ProductStatus;

  pageTitle = 'Manage Products';

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchKeyword = signal('');
  selectedCategoryId = signal('');
  selectedStatus = signal('');

  filteredProducts = computed(() => {
    let list = this.products();
    const keyword = this.searchKeyword().toLowerCase().trim();
    const catId = this.selectedCategoryId();
    const status = this.selectedStatus();

    if (keyword) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.sku.toLowerCase().includes(keyword),
      );
    }
    if (catId) {
      list = list.filter((p) => p.categoryId === catId);
    }
    if (status) {
      list = list.filter((p) => p.status === status);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.loading.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res.data),
    });
  }

  statusLabel(status: ProductStatus): string {
    return status.replace('_', ' ');
  }

  deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: () => this.error.set('Failed to delete product.'),
    });
  }
}
