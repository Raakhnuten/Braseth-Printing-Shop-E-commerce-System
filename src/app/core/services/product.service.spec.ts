import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ProductService } from './product.service';
import { ApiService } from './api.service';
import { MOCK_PRODUCTS } from '../../mock-data/mock-products';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: ApiService, useValue: { get: () => {}, post: () => {}, put: () => {}, delete: () => {} } },
      ],
    });
    service = TestBed.inject(ProductService);
  });

  describe('getProducts', () => {
    it('should return all mock products', async () => {
      const res = await firstValueFrom(service.getProducts());

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data!.length).toBe(MOCK_PRODUCTS.length);
    });

    it('should include meta information', async () => {
      const res = await firstValueFrom(service.getProducts());

      expect(res.meta).toBeDefined();
      expect(res.meta!.totalItems).toBe(MOCK_PRODUCTS.length);
    });
  });

  describe('getProductById', () => {
    it('should return correct product for valid id', async () => {
      const res = await firstValueFrom(service.getProductById('1'));

      expect(res.success).toBe(true);
      expect(res.data).not.toBeNull();
      expect(res.data!.id).toBe('1');
      expect(res.data!.name).toBe('Wireless Bluetooth Headphones');
    });

    it('should return null for non-existent id', async () => {
      const res = await firstValueFrom(service.getProductById('non-existent-id'));

      expect(res.success).toBe(true);
      expect(res.data).toBeNull();
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return only featured products', async () => {
      const res = await firstValueFrom(service.getFeaturedProducts());

      expect(res.success).toBe(true);
      expect(res.data!.length).toBeGreaterThan(0);
      res.data!.forEach((product) => {
        expect(product.featured).toBe(true);
      });
    });

    it('should not include non-featured products', async () => {
      const res = await firstValueFrom(service.getFeaturedProducts());
      const featuredIds = res.data!.map((p) => p.id);

      const nonFeatured = MOCK_PRODUCTS.filter((p) => !p.featured);
      nonFeatured.forEach((product) => {
        expect(featuredIds).not.toContain(product.id);
      });
    });
  });

  describe('getProductsByCategory', () => {
    it('should filter products by categoryId correctly', async () => {
      const res = await firstValueFrom(service.getProductsByCategory('cat-1'));

      expect(res.success).toBe(true);
      expect(res.data!.length).toBeGreaterThan(0);
      res.data!.forEach((product) => {
        expect(product.categoryId).toBe('cat-1');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const res = await firstValueFrom(service.getProductsByCategory('non-existent-cat'));

      expect(res.success).toBe(true);
      expect(res.data!.length).toBe(0);
    });
  });

  describe('searchProducts', () => {
    it('should find products by name', async () => {
      const res = await firstValueFrom(service.searchProducts('headphones'));

      expect(res.success).toBe(true);
      expect(res.data!.length).toBeGreaterThan(0);
      expect(res.data!.some((p) => p.name.toLowerCase().includes('headphones'))).toBe(true);
    });

    it('should find products by description', async () => {
      const res = await firstValueFrom(service.searchProducts('noise cancellation'));

      expect(res.success).toBe(true);
      expect(res.data!.length).toBeGreaterThan(0);
      expect(
        res.data!.some((p) => p.description.toLowerCase().includes('noise cancellation')),
      ).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const resLower = await firstValueFrom(service.searchProducts('headphones'));
      const resUpper = await firstValueFrom(service.searchProducts('HEADPHONES'));

      expect(resLower.data!.length).toBe(resUpper.data!.length);
    });

    it('should return empty array for no matches', async () => {
      const res = await firstValueFrom(service.searchProducts('xyznonexistentxyz'));

      expect(res.success).toBe(true);
      expect(res.data!.length).toBe(0);
    });
  });
});
