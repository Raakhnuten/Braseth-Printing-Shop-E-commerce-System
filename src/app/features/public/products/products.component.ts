import { Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Banner } from '../../../core/models/banner.model';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BannerService } from '../../../core/services/banner.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HeroSliderComponent } from '../../../shared/components/hero-slider/hero-slider.component';
import { CategoryFilterComponent } from '../../../shared/components/category-filter/category-filter.component';
import {
  SortFilterComponent,
  SortState,
  FilterState,
} from '../../../shared/components/sort-filter/sort-filter.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  imports: [ProductCardComponent, EmptyStateComponent, HeroSliderComponent, CategoryFilterComponent, SortFilterComponent],
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private bannerService = inject(BannerService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  banners = signal<Banner[]>([]);
  heroBanners = computed(() => this.banners().filter((b) => b.position === 'HERO' && b.enabled));
  filteredProducts = signal<Product[]>([]);
  loading = signal(true);

  selectedCategory = signal('');

  private sortState: SortState = { option: null, label: '' };
  private filterState: FilterState = {
    categories: [],
    priceMin: null,
    priceMax: null,
    inStock: null,
  };

  readonly skeletonItems = Array(8);

  categoryNames = computed<string[]>(() => this.categories().map((c) => c.name));

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
      this.loading.set(false);
    });

    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.categories.set(res.data || []);
      this.applyFilters();
    });

    this.bannerService.getBanners().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.banners.set(res.data || []);
    });
  }

  applyFilters(): void {
    let result = this.products();

    const cat = this.selectedCategory();
    if (cat) {
      const matched = this.categories().find((c) => c.id === cat || c.slug === cat);
      if (matched) {
        result = result.filter((p) => p.categoryId === matched.id);
      }
    }

    const filter = this.filterState;
    if (filter.categories.length) {
      result = result.filter(
        (p) => p.categoryId && filter.categories.includes(p.categoryName),
      );
    }
    if (filter.priceMin !== null) {
      result = result.filter((p) => p.price >= filter.priceMin!);
    }
    if (filter.priceMax !== null) {
      result = result.filter((p) => p.price <= filter.priceMax!);
    }
    if (filter.inStock === true) {
      result = result.filter((p) => p.stockQuantity > 0);
    }

    const sort = this.sortState.option;
    if (sort === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sort === 'popular') {
      result = [...result].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    } else if (sort === 'rating') {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    this.filteredProducts.set(result);
  }

  onCategoryChange(categoryId: string | null): void {
    this.selectedCategory.set(categoryId ?? '');
    this.applyFilters();
  }

  onSortChanged(sort: SortState): void {
    this.sortState = sort;
    this.applyFilters();
  }

  onFilterChanged(filter: FilterState): void {
    this.filterState = filter;
    this.applyFilters();
  }
}
