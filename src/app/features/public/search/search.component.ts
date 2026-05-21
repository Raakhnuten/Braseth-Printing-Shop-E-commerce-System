import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  imports: [ProductCardComponent, LoadingSpinnerComponent, EmptyStateComponent],
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  keyword = signal('');
  results = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const q = params['q'] || '';
      this.keyword.set(q);
      if (q) {
        this.search(q);
      } else {
        this.results.set([]);
        this.loading.set(false);
      }
    });
  }

  private search(q: string): void {
    this.loading.set(true);
    this.productService.searchProducts(q).subscribe((res) => {
      this.results.set(res.data || []);
      this.loading.set(false);
    });
  }
}
