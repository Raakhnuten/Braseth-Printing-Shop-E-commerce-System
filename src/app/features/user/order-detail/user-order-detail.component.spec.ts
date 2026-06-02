import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserOrderDetailComponent } from './user-order-detail.component';
import { OrderService } from '../../../core/services/order.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '../../../core/models/order.model';
import { Shipment, ShipmentStatus } from '../../../core/models/shipping.model';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.model';

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord-1',
    orderNumber: 'ORD-0001',
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

describe('UserOrderDetailComponent', () => {
  let component: UserOrderDetailComponent;
  let fixture: ComponentFixture<UserOrderDetailComponent>;
  let orderService: OrderService;

  function createComponentWithRouteId(id: string | null): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [UserOrderDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? id : null),
              },
            },
          },
        },
        {
          provide: ShipmentService,
          useValue: { getShipmentByOrderId: () => of({ success: true, message: '', data: null }) },
        },
        {
          provide: InvoiceService,
          useValue: { getInvoiceByOrderId: () => of({ success: true, message: '', data: null }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserOrderDetailComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
  }

  it('should create', () => {
    createComponentWithRouteId('ord-1');
    expect(component).toBeTruthy();
  });

  it('should show error when no order id is provided', () => {
    createComponentWithRouteId(null);
    const spy = vi.spyOn(orderService, 'getOrderById');
    fixture.detectChanges();
    expect(component.error()).toBe('Order ID not found.');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should show error when getOrderById returns error', () => {
    createComponentWithRouteId('ord-1');
    const spy = vi.spyOn(orderService, 'getOrderById');
    spy.mockReturnValue(of({ success: true, message: 'OK', data: null }));
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.orderDetail()).toBeNull();
  });

  it('should set error when getOrderById errors', () => {
    createComponentWithRouteId('ord-1');
    const spy = vi.spyOn(orderService, 'getOrderById');
    spy.mockReturnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();
    expect(component.error()).toBe('Failed to load order details.');
    expect(component.loading()).toBe(false);
  });

  describe('canCancel', () => {
    it('should return false when order is null', () => {
      createComponentWithRouteId('ord-1');
      component.orderDetail.set(null);
      expect(component.canCancel()).toBe(false);
    });

    it('should return false for SHIPPED orders', () => {
      createComponentWithRouteId('ord-1');
      component.orderDetail.set(createOrder({ status: OrderStatus.SHIPPED }));
      expect(component.canCancel()).toBe(false);
    });

    it('should return true for PENDING orders', () => {
      createComponentWithRouteId('ord-1');
      component.orderDetail.set(createOrder({ status: OrderStatus.PENDING }));
      expect(component.canCancel()).toBe(true);
    });
  });
});
