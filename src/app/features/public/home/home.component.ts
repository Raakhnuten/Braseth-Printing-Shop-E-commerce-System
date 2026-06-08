import { Component, DestroyRef, inject, OnInit, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import KeenSlider, { KeenSliderInstance } from 'keen-slider';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Banner } from '../../../core/models/banner.model';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BannerService } from '../../../core/services/banner.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CategoryChipComponent, CategoryChip } from '../../../shared/components/category-chip/category-chip.component';

interface HeroSlide {
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  ctaQueryParams?: Record<string, string>;
  gradient: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [RouterLink, ProductCardComponent, LoadingSpinnerComponent, FormsModule, CategoryChipComponent],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private bannerService = inject(BannerService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private destroyRef = inject(DestroyRef);

  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLElement>;

  banners = signal<Banner[]>([]);
  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  bestSellers = signal<Product[]>([]);
  loading = signal(true);
  newsletterEmail = '';
  searchQuery = signal('');
  currentSlide = 0;
  totalSlides = 0;

  private slider: KeenSliderInstance | null = null;
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;

  slides: HeroSlide[] = [
    {
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on trending fashion and accessories',
      cta: 'Shop Now',
      ctaLink: '/products',
      gradient: 'linear-gradient(135deg, #f97316, #f59e0b)',
      icon: 'pi-tag',
    },
    {
      title: 'New Arrivals',
      subtitle: 'Fresh styles just landed — be the first to explore',
      cta: 'Explore',
      ctaLink: '/products',
      ctaQueryParams: { sort: 'new' },
      gradient: 'linear-gradient(135deg, #1E1446, #35287A)',
      icon: 'pi-star',
    },
    {
      title: 'Premium Footwear',
      subtitle: 'Step up your game with our latest shoe collection',
      cta: 'Browse Shoes',
      ctaLink: '/products',
      ctaQueryParams: { category: 'shoes' },
      gradient: 'linear-gradient(135deg, #0d9488, #14b8a6)',
      icon: 'pi-shopping-bag',
    },
    {
      title: 'Tech & Gadgets',
      subtitle: 'Discover the latest electronics and smart devices',
      cta: 'Discover',
      ctaLink: '/products',
      ctaQueryParams: { category: 'electronics' },
      gradient: 'linear-gradient(135deg, #1e293b, #334155)',
      icon: 'pi-mobile',
    },
    {
      title: 'Beauty & Lifestyle',
      subtitle: 'Premium beauty products for your daily routine',
      cta: 'Shop Beauty',
      ctaLink: '/products',
      ctaQueryParams: { category: 'beauty' },
      gradient: 'linear-gradient(135deg, #db2777, #e11d48)',
      icon: 'pi-heart',
    },
  ];

  categoryChips = computed<CategoryChip[]>(() =>
    this.categories().map((cat) => ({ id: cat.id, name: cat.name, icon: cat.imageUrl }))
  );

  selectedCategoryId = signal<string | number | null>(null);

  onCategorySelected(category: CategoryChip): void {
    this.selectedCategoryId.set(category.id);
    const cat = this.categories().find((c) => c.id === category.id);
    if (cat?.slug) {
      this.router.navigate(['/products'], { queryParams: { category: cat.slug } });
    }
  }

  ngOnInit(): void {
    this.setSEO();
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initSlider();
  }

  ngOnDestroy(): void {
    this.destroySlider();
  }

  private initSlider(): void {
    if (!this.sliderContainer?.nativeElement) return;

    this.totalSlides = this.slides.length;

    this.slider = new KeenSlider(this.sliderContainer.nativeElement, {
      loop: true,
      initial: 0,
      slides: { perView: 1 },
      drag: true,
      slideChanged: (s) => {
        this.currentSlide = s.track.details.rel;
      },
    });

    this.startAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      this.slider?.next();
    }, 5000);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private destroySlider(): void {
    this.stopAutoplay();
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }

  prev(): void {
    this.slider?.prev();
    this.startAutoplay();
  }

  next(): void {
    this.slider?.next();
    this.startAutoplay();
  }

  goTo(idx: number): void {
    this.slider?.moveToIdx(idx);
    this.startAutoplay();
  }

  private setSEO(): void {
    this.titleService.setTitle('BRASETH T-SHIRT PRINTING HOUSE | Premium Custom T-Shirt Printing');

    this.metaService.updateTag({
      name: 'description',
      content: 'Premium custom t-shirt printing at BRASETH T-SHIRT PRINTING HOUSE. Quality fabrics, vibrant designs, and expert craftsmanship. Fast turnaround in Cambodia.',
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 't-shirt printing Cambodia, custom t-shirt Cambodia, BRASETH, premium t-shirt printing, custom printing Phnom Penh, t-shirt design Cambodia',
    });

    this.metaService.updateTag({ property: 'og:title', content: 'BRASETH T-SHIRT PRINTING HOUSE | Premium Custom T-Shirt Printing' });
    this.metaService.updateTag({ property: 'og:description', content: 'Premium custom t-shirt printing at BRASETH T-SHIRT PRINTING HOUSE. Quality fabrics, vibrant designs, and expert craftsmanship. Fast turnaround in Cambodia.' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://braseth.com/assets/og-image.jpg' });

    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'BRASETH T-SHIRT PRINTING HOUSE | Premium Custom T-Shirt Printing' });
    this.metaService.updateTag({ name: 'twitter:description', content: 'Premium custom t-shirt printing at BRASETH T-SHIRT PRINTING HOUSE. Quality fabrics, vibrant designs, and expert craftsmanship.' });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://braseth.com/assets/twitter-image.jpg' });
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

  onSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
      this.searchQuery.set('');
    }
  }

  onNewsletterSubmit(): void {
    if (this.newsletterEmail) {
      alert('Thank you for subscribing to BRASETH newsletter!');
      this.newsletterEmail = '';
    }
  }
}
