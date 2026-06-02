import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CheckoutComponent } from './checkout.component';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart.model';

function createCartItem(overrides?: Partial<CartItem>): CartItem {
  return {
    id: 'ci-1',
    productId: 'p1',
    productName: 'Test Product',
    productSlug: 'test-product',
    productImage: '',
    unitPrice: 10,
    quantity: 1,
    subtotal: 10,
    selectedSize: null,
    selectedColor: null,
    selectedDecorationMethod: null,
    selectedPrintPosition: null,
    uploadedDesignFiles: [],
    selectedPrintColors: [],
    customizationFee: 0,
    productionTime: null,
    maxQuantity: 10,
    stockQuantity: 10,
    salePrice: null,
    ...overrides,
  };
}

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let checkoutService: CheckoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    checkoutService = TestBed.inject(CheckoutService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize validation errors as empty', () => {
    expect(component.orderValidationErrors()).toEqual([]);
    expect(component.submitError()).toBeNull();
  });

  it('should set and clear orderValidationErrors', () => {
    component.orderValidationErrors.set(['Error 1']);
    expect(component.orderValidationErrors()).toEqual(['Error 1']);
    component.orderValidationErrors.set([]);
    expect(component.orderValidationErrors()).toEqual([]);
  });

  it('should set and clear submitError', () => {
    component.submitError.set('Something went wrong');
    expect(component.submitError()).toBe('Something went wrong');
    component.submitError.set(null);
    expect(component.submitError()).toBeNull();
  });

  it('should clear errors and skip createOrder when validation fails', () => {
    const validateSpy = vi.spyOn(checkoutService, 'validateOrderBeforeCreate');
    const createSpy = vi.spyOn(checkoutService, 'createOrder');

    validateSpy.mockReturnValue(of({
      success: true, message: 'Validation failed',
      data: { valid: false, errors: ['Price mismatch.', 'Coupon expired.'], serverPrices: { subtotal: 0, discount: 0, deliveryFee: 0, customizationFeeTotal: 0, tax: 0, grandTotal: 0 } },
    }));
    createSpy.mockReturnValue(of({ success: true, message: '', data: { orderId: '', orderNumber: '' } }));

    component.form.setValue({ name: 'Alice', email: 'alice@test.com', telegram: '@alice', address: '123 St', note: '' });
    (component as any).shippingMethods.set([{ id: 'sm-1', name: 'Std', code: 'std', description: '', baseFee: 5, isActive: true, estimatedDeliveryTime: '3d', sortOrder: 0 }]);
    (component as any).selectedShippingMethod.set({ id: 'sm-1', name: 'Std', code: 'std', description: '', baseFee: 5, isActive: true, estimatedDeliveryTime: '3d', sortOrder: 0 });
    (component as any).selectedShippingZone.set(null);

    const cartService = TestBed.inject(CartService) as any;
    cartService.cartItems.set([createCartItem()]);

    component.orderValidationErrors.set(['Old error']);
    component.submitError.set('Old submit error');

    component.placeOrder();

    expect(validateSpy).toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    expect(component.orderValidationErrors()).toEqual(['Price mismatch.', 'Coupon expired.']);
    expect(component.submitError()).toBeNull();
  });
});
