import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { ApiService } from './api.service';
import { Product, ProductStatus } from '../models/product.model';

describe('CartService', () => {
  let service: CartService;

  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product',
    price: 50,
    salePrice: null,
    stockQuantity: 100,
    sku: 'TP-001',
    thumbnailUrl: 'https://example.com/img.png',
    images: [],
    featured: false,
    enabled: true,
    status: ProductStatus.ACTIVE,
    categoryId: 'cat-1',
    categoryName: 'Test Category',
    allowReview: true,
    allowCoupon: true,
    allowCart: true,
    allowCheckout: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockProductExpensive: Product = {
    ...mockProduct,
    id: 'prod-2',
    name: 'Expensive Product',
    slug: 'expensive-product',
    price: 120,
    salePrice: null,
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: ApiService, useValue: { get: () => {}, post: () => {}, put: () => {}, delete: () => {} } },
      ],
    });
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('addProductToCart', () => {
    it('should add a new item to the cart', () => {
      service.addProductToCart(mockProduct, 2);

      const items = service.items();
      expect(items.length).toBe(1);
      expect(items[0].productId).toBe('prod-1');
      expect(items[0].productName).toBe('Test Product');
      expect(items[0].quantity).toBe(2);
      expect(items[0].unitPrice).toBe(50);
      expect(items[0].subtotal).toBe(100);
    });

    it('should increment quantity for existing product with same productId and no decoration', () => {
      service.addProductToCart(mockProduct, 1);
      service.addProductToCart(mockProduct, 3);

      const items = service.items();
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(4);
    });

    it('should use salePrice as unitPrice when product has salePrice', () => {
      const saleProduct: Product = { ...mockProduct, salePrice: 35 };
      service.addProductToCart(saleProduct, 1);

      const items = service.items();
      expect(items[0].unitPrice).toBe(35);
    });
  });

  describe('updateQuantity', () => {
    it('should change quantity correctly', () => {
      service.addProductToCart(mockProduct, 2);
      service.updateQuantity('prod-1', 5);

      const items = service.items();
      expect(items[0].quantity).toBe(5);
      expect(items[0].subtotal).toBe(250);
    });

    it('should remove item when quantity is 0', () => {
      service.addProductToCart(mockProduct, 2);
      service.updateQuantity('prod-1', 0);

      const items = service.items();
      expect(items.length).toBe(0);
    });

    it('should remove item when quantity is negative', () => {
      service.addProductToCart(mockProduct, 2);
      service.updateQuantity('prod-1', -1);

      const items = service.items();
      expect(items.length).toBe(0);
    });
  });

  describe('removeItem', () => {
    it('should remove item by id', () => {
      service.addProductToCart(mockProduct, 1);
      const itemId = service.items()[0].id;

      service.removeItem(itemId);
      expect(service.items().length).toBe(0);
    });

    it('should remove item by productId', () => {
      service.addProductToCart(mockProduct, 1);

      service.removeItem('prod-1');
      expect(service.items().length).toBe(0);
    });

    it('should not affect other items', () => {
      service.addProductToCart(mockProduct, 1);
      service.addProductToCart(mockProductExpensive, 1);

      service.removeItem('prod-1');
      const items = service.items();
      expect(items.length).toBe(1);
      expect(items[0].productId).toBe('prod-2');
    });
  });

  describe('clearCart', () => {
    it('should empty all items', () => {
      service.addProductToCart(mockProduct, 2);
      service.addProductToCart(mockProductExpensive, 1);

      service.clearCart();
      expect(service.items().length).toBe(0);
    });
  });

  describe('getCartItemCount', () => {
    it('should return correct sum of all item quantities', () => {
      service.addProductToCart(mockProduct, 3);
      service.addProductToCart(mockProductExpensive, 2);

      expect(service.getCartItemCount()).toBe(5);
    });

    it('should return 0 for empty cart', () => {
      expect(service.getCartItemCount()).toBe(0);
    });
  });

  describe('isInCart', () => {
    it('should return true when product is in cart', () => {
      service.addProductToCart(mockProduct, 1);
      expect(service.isInCart('prod-1')).toBe(true);
    });

    it('should return false when product is not in cart', () => {
      expect(service.isInCart('prod-1')).toBe(false);
    });
  });

  describe('calculateCartTotals', () => {
    it('should compute correct subtotal, total, and shippingFee', () => {
      service.addProductToCart(mockProduct, 2); // 50 * 2 = 100

      const cart = service.calculateCartTotals();
      expect(cart.subtotal).toBe(100);
      expect(cart.shippingFee).toBe(9.99);
      expect(cart.discount).toBe(0);
      expect(cart.total).toBe(109.99);
      expect(cart.totalItems).toBe(2);
    });

    it('should apply free shipping when subtotal is greater than 100', () => {
      service.addProductToCart(mockProductExpensive, 1); // 120 * 1 = 120

      const cart = service.calculateCartTotals();
      expect(cart.subtotal).toBe(120);
      expect(cart.shippingFee).toBe(0);
      expect(cart.total).toBe(120);
    });

    it('should charge shipping when subtotal is exactly 100', () => {
      service.addProductToCart(mockProduct, 2); // 50 * 2 = 100, not > 100

      const cart = service.calculateCartTotals();
      expect(cart.shippingFee).toBe(9.99);
    });

    it('should include customizationFeeTotal in total', () => {
      // Add a customized product
      service.addProductWithCustomization(mockProduct, 1, ['Red'], 'Screen Print', 'art.png', 60);

      const cart = service.calculateCartTotals();
      // unitPrice is 60, customizationFee = 60 - 50 = 10
      expect(cart.customizationFeeTotal).toBe(10);
      expect(cart.subtotal).toBe(60);
      expect(cart.total).toBe(60 + 10 + 9.99); // subtotal + customization + shipping
    });
  });

  describe('saveGuestCartToLocalStorage', () => {
    it('should persist items to localStorage', () => {
      service.addProductToCart(mockProduct, 2);

      const stored = localStorage.getItem('seth_store_cart');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].productId).toBe('prod-1');
      expect(parsed[0].quantity).toBe(2);
    });
  });

  describe('loadGuestCartFromLocalStorage', () => {
    it('should restore items from localStorage', () => {
      const cartData = [
        {
          id: 'cart-item-1',
          productId: 'prod-1',
          productName: 'Test Product',
          productSlug: 'test-product',
          productImage: 'img.png',
          unitPrice: 50,
          quantity: 3,
          subtotal: 150,
          selectedSize: null,
          selectedColor: null,
          selectedDecorationMethod: null,
          selectedPrintPosition: null,
          uploadedDesignFiles: [],
          selectedPrintColors: [],
          customizationFee: 0,
          productionTime: null,
          maxQuantity: 100,
          stockQuantity: 100,
          salePrice: null,
        },
      ];
      localStorage.setItem('seth_store_cart', JSON.stringify(cartData));

      const items = service.loadGuestCartFromLocalStorage();
      expect(items.length).toBe(1);
      expect(items[0].productId).toBe('prod-1');
      expect(items[0].quantity).toBe(3);
    });

    it('should return empty array when no data in localStorage', () => {
      const items = service.loadGuestCartFromLocalStorage();
      expect(items).toEqual([]);
    });

    it('should return empty array for invalid JSON', () => {
      localStorage.setItem('seth_store_cart', 'not-valid-json');
      const items = service.loadGuestCartFromLocalStorage();
      expect(items).toEqual([]);
    });
  });
});
