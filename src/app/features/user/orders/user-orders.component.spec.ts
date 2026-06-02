import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserOrdersComponent } from './user-orders.component';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '../../../core/models/order.model';

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'oid-' + Math.random().toString(36).substring(2, 6),
    orderNumber: 'ORD-' + Date.now(),
    userId: 'user-1',
    customerName: 'Test User',
    email: 'test@test.com',
    phone: '',
    telegramUsername: '',
    address: '123 St',
    note: '',
    items: [],
    subtotal: 100,
    discount: 0,
    deliveryFee: 10,
    customizationFeeTotal: 0,
    tax: 0,
    grandTotal: 110,
    totalItems: 1,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    shippingStatus: ShippingStatus.NOT_SHIPPED,
    paymentMethodId: 'cod',
    paymentMethodName: 'COD',
    paymentTransactionId: null,
    paymentProofUrl: null,
    shippingMethodId: 'sm-1',
    shippingMethodName: 'Standard',
    shippingZoneId: null,
    shippingZoneName: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('UserOrdersComponent', () => {
  let component: UserOrdersComponent;
  let fixture: ComponentFixture<UserOrdersComponent>;
  let orderService: OrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOrdersComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UserOrdersComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    const spy = vi.spyOn(orderService, 'getMyOrders');
    spy.mockReturnValue(of({ success: true, message: 'OK', data: [createOrder()] }));
    fixture.detectChanges();
    expect(component.allOrders().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should handle empty orders', () => {
    const spy = vi.spyOn(orderService, 'getMyOrders');
    spy.mockReturnValue(of({ success: true, message: 'OK', data: [] }));
    fixture.detectChanges();
    expect(component.allOrders().length).toBe(0);
    expect(component.loading()).toBe(false);
  });

  it('should filter orders by status', () => {
    const spy = vi.spyOn(orderService, 'getMyOrders');
    spy.mockReturnValue(of({
      success: true,
      message: 'OK',
      data: [
        createOrder({ id: 'o1', orderNumber: 'ORD-1', status: OrderStatus.PENDING }),
        createOrder({ id: 'o2', orderNumber: 'ORD-2', status: OrderStatus.DELIVERED }),
      ],
    }));
    fixture.detectChanges();

    expect(component.filteredOrders().length).toBe(2);

    component.statusFilter.set('DELIVERED');
    expect(component.filteredOrders().length).toBe(1);
    expect(component.filteredOrders()[0].orderNumber).toBe('ORD-2');
  });

  it('should search orders by order number', () => {
    const spy = vi.spyOn(orderService, 'getMyOrders');
    spy.mockReturnValue(of({
      success: true,
      message: 'OK',
      data: [
        createOrder({ id: 'o1', orderNumber: 'ORD-001' }),
        createOrder({ id: 'o2', orderNumber: 'ORD-002' }),
        createOrder({ id: 'o3', orderNumber: 'INV-001' }),
      ],
    }));
    fixture.detectChanges();

    expect(component.filteredOrders().length).toBe(3);

    component.searchQuery.set('ORD');
    expect(component.filteredOrders().length).toBe(2);

    component.searchQuery.set('INV');
    expect(component.filteredOrders().length).toBe(1);
  });

  it('should sort orders by newest first (default)', () => {
    const spy = vi.spyOn(orderService, 'getMyOrders');
    spy.mockReturnValue(of({
      success: true,
      message: 'OK',
      data: [
        createOrder({ id: 'o1', orderNumber: 'ORD-1', createdAt: '2024-01-01T00:00:00Z' }),
        createOrder({ id: 'o2', orderNumber: 'ORD-2', createdAt: '2024-06-01T00:00:00Z' }),
      ],
    }));
    fixture.detectChanges();

    expect(component.filteredOrders()[0].id).toBe('o2');
    expect(component.filteredOrders()[1].id).toBe('o1');
  });

  it('should sort orders by oldest first', () => {
    const spy = vi.spyOn(orderService, 'getMyOrders');
    spy.mockReturnValue(of({
      success: true,
      message: 'OK',
      data: [
        createOrder({ id: 'o1', orderNumber: 'ORD-1', createdAt: '2024-01-01T00:00:00Z' }),
        createOrder({ id: 'o2', orderNumber: 'ORD-2', createdAt: '2024-06-01T00:00:00Z' }),
      ],
    }));
    fixture.detectChanges();

    component.sortOrder.set('oldest');
    expect(component.filteredOrders()[0].id).toBe('o1');
    expect(component.filteredOrders()[1].id).toBe('o2');
  });
});
