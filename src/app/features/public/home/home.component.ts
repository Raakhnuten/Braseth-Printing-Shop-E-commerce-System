import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Banner } from '../../../core/models/banner.model';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BannerService } from '../../../core/services/banner.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [RouterLink, ProductCardComponent, LoadingSpinnerComponent, FormsModule],
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private bannerService = inject(BannerService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private destroyRef = inject(DestroyRef);

  banners = signal<Banner[]>([]);
  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  bestSellers = signal<Product[]>([]);
  loading = signal(true);
  newsletterEmail = '';

  // Predefined categories for display
  displayCategories = [
    { id: 'men', name: 'Men', icon: 'pi-user', description: 'Fashion for men', route: '/products', queryParams: { category: 'men' } },
    { id: 'women', name: 'Women', icon: 'pi-user', description: 'Fashion for women', route: '/products', queryParams: { category: 'women' } },
    { id: 'shoes', name: 'Shoes', icon: 'pi-shopping-bag', description: 'Footwear collection', route: '/products', queryParams: { category: 'shoes' } },
    { id: 'electronics', name: 'Electronics', icon: 'pi-mobile', description: 'Latest gadgets', route: '/products', queryParams: { category: 'electronics' } },
    { id: 'beauty', name: 'Beauty', icon: 'pi-heart', description: 'Beauty products', route: '/products', queryParams: { category: 'beauty' } },
    { id: 'home', name: 'Home & Living', icon: 'pi-home', description: 'Home essentials', route: '/products', queryParams: { category: 'home' } },
  ];

  ngOnInit(): void {
    this.setSEO();
    this.loadData();
  }

  private setSEO(): void {
    this.titleService.setTitle('Seth Store | Fashion, Shoes, Electronics & Lifestyle Products in Cambodia');
    
    this.metaService.updateTag({
      name: 'description',
      content: 'Shop stylish fashion, shoes, electronics, beauty, and lifestyle products at Seth Store. Discover trending products, fast delivery, secure checkout, and great deals in Cambodia.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'Cambodia online store, ecommerce Cambodia, fashion Cambodia, shoes Cambodia, electronics Cambodia, Seth Store, online shopping Cambodia'
    });

    // Open Graph tags
    this.metaService.updateTag({ property: 'og:title', content: 'Seth Store | Fashion, Shoes, Electronics & Lifestyle Products in Cambodia' });
    this.metaService.updateTag({ property: 'og:description', content: 'Shop stylish fashion, shoes, electronics, beauty, and lifestyle products at Seth Store. Discover trending products, fast delivery, secure checkout, and great deals in Cambodia.' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://sethstore.com/assets/og-image.jpg' });

    // Twitter Card tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'Seth Store | Fashion, Shoes, Electronics & Lifestyle Products in Cambodia' });
    this.metaService.updateTag({ name: 'twitter:description', content: 'Shop stylish fashion, shoes, electronics, beauty, and lifestyle products at Seth Store.' });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://sethstore.com/assets/twitter-image.jpg' });
  }

  private loadData(): void {
    this.loading.set(true);

    this.bannerService.getBanners().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.banners.set(res.data || []);
    });

    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.categories.set((res.data || []).slice(0, 6));
    });

    this.productService.getFeaturedProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      const products = res.data || [];
      this.featuredProducts.set(products.slice(0, 8));
      this.bestSellers.set(products.slice(8, 16));
      this.loading.set(false);
    });
  }

  onNewsletterSubmit(): void {
    if (this.newsletterEmail) {
      alert('Thank you for subscribing to Seth Store newsletter!');
      this.newsletterEmail = '';
    }
  }
}
