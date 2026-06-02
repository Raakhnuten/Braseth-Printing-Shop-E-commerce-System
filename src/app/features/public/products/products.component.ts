import { Component, DestroyRef, inject, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  imports: [FormsModule, ProductCardComponent, EmptyStateComponent],
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(true);

  selectedCategory = signal('');
  sortBy = signal('recommend');

  readonly skeletonItems = Array(8);

  @ViewChild('categoryScroll') categoryScrollRef?: ElementRef<HTMLElement>;

  categoryCounts = computed<Map<string, number>>(() => {
    const counts = new Map<string, number>();
    for (const p of this.products()) {
      const key = p.categoryId;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  });

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }

    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);

    this.productService.getProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.products.set(res.data || []);
      this.applyFilters();
      this.loading.set(false);
    });

    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.categories.set(res.data || []);
    });
  }

  applyFilters(): void {
    let result = this.products();

    const cat = this.selectedCategory();
    if (cat) {
      result = result.filter((p) => p.categoryId === cat);
    }

    const sort = this.sortBy();
    if (sort === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    this.filteredProducts.set(result);
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.applyFilters();
  }

  onSortChange(sort: string): void {
    this.sortBy.set(sort);
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory.set('');
    this.sortBy.set('recommend');
    this.applyFilters();
  }

  scrollCategories(direction: 'left' | 'right'): void {
    const el = this.categoryScrollRef?.nativeElement;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }

  canScrollLeft(): boolean {
    const el = this.categoryScrollRef?.nativeElement;
    return el ? el.scrollLeft > 4 : false;
  }

  canScrollRight(): boolean {
    const el = this.categoryScrollRef?.nativeElement;
    if (!el) return false;
    return el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
  }
}
