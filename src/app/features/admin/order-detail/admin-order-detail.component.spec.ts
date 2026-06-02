import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminOrderDetailComponent } from './admin-order-detail.component';
import { OrderService } from '../../../core/services/order.service';
import { ShipmentService, CreateShipmentPayload } from '../../../core/services/shipment.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '../../../core/models/order.model';
import { Shipment, ShipmentStatus } from '../../../core/models/shipping.model';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.model';

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord-1',
    orderNumber: 'ORD-0001',
    userId: 'user-1',
    customerName: 'Test Admin',
    email: 'admin@test.com',
    phone: '',
    telegramUsername: '',
    address: '123 Admin St',
    note: '',
    items: [],
    subtotal: 200,
    discount: 0,
    deliveryFee: 15,
    customizationFeeTotal: 0,
    tax: 0,
    grandTotal: 215,
    totalItems: 2,
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

function createShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'shp-1',
    orderId: 'ord-1',
    shipmentNumber: 'SHP-0001',
    shippingMethodId: 'sm-1',
    shippingMethodName: 'Standard',
    shippingZoneId: null,
    shippingZoneName: null,
    carrierName: 'UPS',
    trackingNumber: '1Z999AA10123456784',
    trackingUrl: 'https://track.example.com/1Z999AA10123456784',
    status: ShipmentStatus.SHIPPED,
    shippedAt: '2024-01-02T00:00:00Z',
    deliveredAt: null,
    note: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function createInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-1',
    invoiceNumber: 'INV-0001',
    orderId: 'ord-1',
    customerName: 'Test Admin',
    customerEmail: 'admin@test.com',
    billingAddress: '123 Admin St',
    subtotal: 200,
    discount: 0,
    deliveryFee: 15,
    customizationFeeTotal: 0,
    tax: 0,
    grandTotal: 215,
    currency: 'USD',
    status: InvoiceStatus.ISSUED,
    issuedAt: '2024-01-02T00:00:00Z',
    paidAt: null,
    dueAt: null,
    downloadUrl: null,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    ...overrides,
  };
}

describe('AdminOrderDetailComponent', () => {
  let component: AdminOrderDetailComponent;
  let fixture: ComponentFixture<AdminOrderDetailComponent>;
  let orderService: OrderService;
  let shipmentService: ShipmentService;
  let invoiceService: InvoiceService;

  function createComponentWithRouteId(id: string | null): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AdminOrderDetailComponent],
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
          provide: OrderService,
          useValue: {
            getOrderById: () => of({ success: true, message: 'OK', data: null }),
            updateOrderStatus: () => of({ success: true, message: 'OK', data: null }),
            updatePaymentStatus: () => of({ success: true, message: 'OK', data: null }),
            cancelOrder: () => of({ success: true, message: 'OK', data: null }),
          },
        },
        {
          provide: ShipmentService,
          useValue: {
            getShipmentByOrderId: () => of({ success: true, message: '', data: null }),
            createShipment: () => of({ success: true, message: '', data: null }),
            updateTrackingNumber: () => of({ success: true, message: '', data: null }),
          },
        },
        {
          provide: InvoiceService,
          useValue: {
            getInvoiceByOrderId: () => of({ success: true, message: '', data: null }),
            generateInvoice: () => of({ success: true, message: '', data: null }),
            markInvoicePaid: () => of({ success: true, message: '', data: null }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrderDetailComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService);
    shipmentService = TestBed.inject(ShipmentService);
    invoiceService = TestBed.inject(InvoiceService);
  }

  // ─── Creation & loading ────────────────────────────────

  it('should create', () => {
    createComponentWithRouteId('ord-1');
    expect(component).toBeTruthy();
  });

  it('should show error when no order id is provided', () => {
    createComponentWithRouteId(null);
    const spy = vi.spyOn(orderService, 'getOrderById');
    fixture.detectChanges();
    expect(component.error()).toBe('Order ID not found');
    expect(spy).not.toHaveBeenCalled();
  });

  it('should set loading and call getOrderById on init', () => {
    createComponentWithRouteId('ord-1');
    const spy = vi.spyOn(orderService, 'getOrderById');
    spy.mockReturnValue(of({ success: true, message: 'OK', data: createOrder() }));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('ord-1');
  });

  it('should set error when getOrderById errors', () => {
    createComponentWithRouteId('ord-1');
    const spy = vi.spyOn(orderService, 'getOrderById');
    spy.mockReturnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();
    expect(component.error()).toBe('Failed to load order details');
    expect(component.loading()).toBe(false);
  });

  it('should load shipment and invoice after order loads', () => {
    createComponentWithRouteId('ord-1');
    vi.spyOn(orderService, 'getOrderById').mockReturnValue(of({ success: true, message: 'OK', data: createOrder() }));
    const shipSpy = vi.spyOn(shipmentService, 'getShipmentByOrderId').mockReturnValue(of({ success: true, message: '', data: createShipment() }));
    const invSpy = vi.spyOn(invoiceService, 'getInvoiceByOrderId').mockReturnValue(of({ success: true, message: '', data: createInvoice() }));
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.order()?.orderNumber).toBe('ORD-0001');
    expect(shipSpy).toHaveBeenCalledWith('ord-1');
    expect(invSpy).toHaveBeenCalledWith('ord-1');
    expect(component.shipment()?.trackingNumber).toBe('1Z999AA10123456784');
    expect(component.invoice()?.invoiceNumber).toBe('INV-0001');
  });

  // ─── pageTitle ─────────────────────────────────────────

  it('should return "Order Detail" when no order loaded', () => {
    createComponentWithRouteId('ord-1');
    expect(component.pageTitle).toBe('Order Detail');
  });

  it('should return order number in pageTitle when order loaded', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    expect(component.pageTitle).toBe('Order ORD-0001');
  });

  // ─── Order status update ───────────────────────────────

  it('should call updateOrderStatus when updateStatus is called', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.selectedNewStatus.set(OrderStatus.CONFIRMED);
    const spy = vi.spyOn(orderService, 'updateOrderStatus');
    spy.mockReturnValue(of({ success: true, message: 'OK', data: null }));
    component.updateStatus();
    expect(spy).toHaveBeenCalledWith('ord-1', OrderStatus.CONFIRMED);
  });

  it('should set message on updateStatus success', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.selectedNewStatus.set(OrderStatus.CONFIRMED);
    vi.spyOn(orderService, 'updateOrderStatus').mockReturnValue(of({ success: true, message: 'OK', data: null }));
    const loadSpy = vi.spyOn(component as any, 'loadOrder');
    component.updateStatus();
    expect(loadSpy).toHaveBeenCalledWith('ord-1');
  });

  it('should set error message on updateStatus failure', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    vi.spyOn(orderService, 'updateOrderStatus').mockReturnValue(throwError(() => new Error('fail')));
    component.updateStatus();
    expect(component.statusUpdateMessage()).toBe('Failed to update status');
  });

  // ─── Payment status update ─────────────────────────────

  it('should call updatePaymentStatus when updatePaymentStatusAction is called', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.selectedPaymentStatus.set(PaymentStatus.PAID);
    const spy = vi.spyOn(orderService, 'updatePaymentStatus');
    spy.mockReturnValue(of({ success: true, message: 'OK', data: null }));
    component.updatePaymentStatusAction();
    expect(spy).toHaveBeenCalledWith('ord-1', PaymentStatus.PAID);
  });

  it('should set message on payment update success', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.selectedPaymentStatus.set(PaymentStatus.PAID);
    vi.spyOn(orderService, 'updatePaymentStatus').mockReturnValue(of({ success: true, message: 'OK', data: null }));
    const loadSpy = vi.spyOn(component as any, 'loadOrder');
    component.updatePaymentStatusAction();
    expect(loadSpy).toHaveBeenCalledWith('ord-1');
  });

  it('should set error message on payment update failure', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    vi.spyOn(orderService, 'updatePaymentStatus').mockReturnValue(throwError(() => new Error('fail')));
    component.updatePaymentStatusAction();
    expect(component.paymentUpdateMessage()).toBe('Failed to update payment status');
  });

  // ─── Cancel order ──────────────────────────────────────

  it('should call cancelOrder when cancelOrder is confirmed', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder({ status: OrderStatus.PENDING }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const spy = vi.spyOn(orderService, 'cancelOrder');
    spy.mockReturnValue(of({ success: true, message: 'OK', data: null }));
    component.cancelOrder();
    expect(spy).toHaveBeenCalledWith('ord-1');
  });

  it('should not call cancelOrder when confirm is denied', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const spy = vi.spyOn(orderService, 'cancelOrder');
    component.cancelOrder();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should set message on cancel success', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder({ status: OrderStatus.PENDING }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(orderService, 'cancelOrder').mockReturnValue(of({ success: true, message: 'OK', data: null }));
    const loadSpy = vi.spyOn(component as any, 'loadOrder');
    component.cancelOrder();
    expect(loadSpy).toHaveBeenCalledWith('ord-1');
  });

  it('should set error message on cancel failure', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder({ status: OrderStatus.PENDING }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(orderService, 'cancelOrder').mockReturnValue(throwError(() => new Error('fail')));
    component.cancelOrder();
    expect(component.statusUpdateMessage()).toBe('Failed to cancel order');
  });

  // ─── canCancel ─────────────────────────────────────────

  it('canCancel returns false when order is null', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(null);
    expect(component.canCancel()).toBe(false);
  });

  it('canCancel returns true for cancellable statuses', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder({ status: OrderStatus.PENDING }));
    expect(component.canCancel()).toBe(true);
    component.order.set(createOrder({ status: OrderStatus.CONFIRMED }));
    expect(component.canCancel()).toBe(true);
    component.order.set(createOrder({ status: OrderStatus.PROCESSING }));
    expect(component.canCancel()).toBe(true);
  });

  it('canCancel returns false for non-cancellable statuses', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder({ status: OrderStatus.SHIPPED }));
    expect(component.canCancel()).toBe(false);
    component.order.set(createOrder({ status: OrderStatus.DELIVERED }));
    expect(component.canCancel()).toBe(false);
    component.order.set(createOrder({ status: OrderStatus.CANCELLED }));
    expect(component.canCancel()).toBe(false);
  });

  // ─── Shipment form ─────────────────────────────────────

  it('should open shipment form and pre-fill tracking values', () => {
    createComponentWithRouteId('ord-1');
    component.shipment.set(createShipment());
    component.openShipmentForm();
    expect(component.showShipmentForm()).toBe(true);
    expect(component.shipmentTracking()).toBe('1Z999AA10123456784');
    expect(component.shipmentCarrier()).toBe('UPS');
    expect(component.shipmentMessage()).toBe('');
  });

  it('should close shipment form', () => {
    createComponentWithRouteId('ord-1');
    component.showShipmentForm.set(true);
    component.closeShipmentForm();
    expect(component.showShipmentForm()).toBe(false);
  });

  // ─── Shipment create ───────────────────────────────────

  it('saveShipment should create shipment when no existing shipment', () => {
    createComponentWithRouteId('ord-1');
    const order = createOrder();
    component.order.set(order);
    component.shipment.set(null);
    component.shipmentTracking.set('NEWTRACK123');
    component.shipmentCarrier.set('FedEx');
    const spy = vi.spyOn(shipmentService, 'createShipment');
    spy.mockReturnValue(of({ success: true, message: 'Created', data: null }));
    component.saveShipment();
    const expected: CreateShipmentPayload = {
      orderId: 'ord-1',
      shippingMethodId: 'sm-1',
      shippingMethodName: 'Standard',
      shippingZoneId: null,
      shippingZoneName: null,
      trackingNumber: 'NEWTRACK123',
      carrierName: 'FedEx',
    };
    expect(spy).toHaveBeenCalledWith(expected);
  });

  it('saveShipment should close form and load shipment on create success', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.shipment.set(null);
    vi.spyOn(shipmentService, 'createShipment').mockReturnValue(of({ success: true, message: 'Created', data: null }));
    const loadSpy = vi.spyOn(component as any, 'loadShipment');
    component.saveShipment();
    expect(component.showShipmentForm()).toBe(false);
    expect(component.shipmentMessage()).toBe('Shipment created');
    expect(loadSpy).toHaveBeenCalledWith('ord-1');
  });

  it('saveShipment should set error message on create failure', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.shipment.set(null);
    vi.spyOn(shipmentService, 'createShipment').mockReturnValue(throwError(() => new Error('fail')));
    component.saveShipment();
    expect(component.shipmentMessage()).toBe('Failed to create shipment');
  });

  // ─── Shipment update ───────────────────────────────────

  it('saveShipment should update tracking when existing shipment', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.shipment.set(createShipment({ id: 'shp-1' }));
    component.shipmentTracking.set('NEWTRACK999');
    const spy = vi.spyOn(shipmentService, 'updateTrackingNumber');
    spy.mockReturnValue(of({ success: true, message: 'Updated', data: null }));
    component.saveShipment();
    expect(spy).toHaveBeenCalledWith('shp-1', 'NEWTRACK999');
  });

  it('saveShipment should close form on tracking update success', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.shipment.set(createShipment({ id: 'shp-1' }));
    component.shipmentTracking.set('NEWTRACK999');
    vi.spyOn(shipmentService, 'updateTrackingNumber').mockReturnValue(of({ success: true, message: 'Updated', data: null }));
    const loadSpy = vi.spyOn(component as any, 'loadShipment');
    component.saveShipment();
    expect(component.showShipmentForm()).toBe(false);
    expect(loadSpy).toHaveBeenCalledWith('ord-1');
  });

  it('saveShipment should set error message on tracking update failure', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    component.shipment.set(createShipment({ id: 'shp-1' }));
    component.shipmentTracking.set('NEWTRACK999');
    vi.spyOn(shipmentService, 'updateTrackingNumber').mockReturnValue(throwError(() => new Error('fail')));
    component.saveShipment();
    expect(component.shipmentMessage()).toBe('Failed to update tracking');
  });

  // ─── Invoice generate ──────────────────────────────────

  it('generateInvoice should call invoiceService.generateInvoice', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    const spy = vi.spyOn(invoiceService, 'generateInvoice');
    spy.mockReturnValue(of({ success: true, message: 'Generated', data: null }));
    component.generateInvoice();
    expect(spy).toHaveBeenCalledWith('ord-1');
  });

  it('generateInvoice should reload invoice on success', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(createOrder());
    vi.spyOn(invoiceService, 'generateInvoice').mockReturnValue(of({ success: true, message: 'Generated', data: null }));
    const loadSpy = vi.spyOn(component as any, 'loadInvoice');
    component.generateInvoice();
    expect(loadSpy).toHaveBeenCalledWith('ord-1');
  });

  // ─── Invoice mark paid ─────────────────────────────────

  it('markInvoicePaid should call invoiceService.markInvoicePaid', () => {
    createComponentWithRouteId('ord-1');
    component.invoice.set(createInvoice({ id: 'inv-1' }));
    const spy = vi.spyOn(invoiceService, 'markInvoicePaid');
    spy.mockReturnValue(of({ success: true, message: 'Paid', data: null }));
    component.markInvoicePaid();
    expect(spy).toHaveBeenCalledWith('inv-1');
  });

  it('markInvoicePaid should load invoice by orderId on success', () => {
    createComponentWithRouteId('ord-1');
    component.invoice.set(createInvoice({ id: 'inv-1', orderId: 'ord-1' }));
    vi.spyOn(invoiceService, 'markInvoicePaid').mockReturnValue(of({ success: true, message: 'Paid', data: null }));
    const loadSpy = vi.spyOn(component as any, 'loadInvoice');
    component.markInvoicePaid();
    expect(loadSpy).toHaveBeenCalledWith('ord-1');
  });

  it('markInvoicePaid should not call service when no invoice', () => {
    createComponentWithRouteId('ord-1');
    component.invoice.set(null);
    const spy = vi.spyOn(invoiceService, 'markInvoicePaid');
    component.markInvoicePaid();
    expect(spy).not.toHaveBeenCalled();
  });

  // ─── openUrl ───────────────────────────────────────────

  it('openUrl should call window.open for safe URLs', () => {
    createComponentWithRouteId('ord-1');
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    component.openUrl('https://track.example.com/pkg');
    expect(openSpy).toHaveBeenCalledWith('https://track.example.com/pkg', '_blank');
    openSpy.mockRestore();
  });

  it('openUrl should not call window.open for unsafe URLs', () => {
    createComponentWithRouteId('ord-1');
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    component.openUrl('javascript:alert(1)');
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('openUrl should not call window.open for null', () => {
    createComponentWithRouteId('ord-1');
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    component.openUrl(null);
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  // ─── Helper methods ────────────────────────────────────

  it('getStatusLabel delegates to getOrderStatusLabel', () => {
    createComponentWithRouteId('ord-1');
    expect(component.getStatusLabel('PENDING')).toBe('Pending');
    expect(component.getStatusLabel('SHIPPED')).toBe('Shipped');
  });

  it('getPayLabel delegates to getPaymentStatusLabel', () => {
    createComponentWithRouteId('ord-1');
    expect(component.getPayLabel('PAID')).toBe('Paid');
    expect(component.getPayLabel('FAILED')).toBe('Failed');
  });

  it('getShipLabel delegates to getShippingStatusLabel', () => {
    createComponentWithRouteId('ord-1');
    expect(component.getShipLabel('IN_TRANSIT')).toBe('In Transit');
    expect(component.getShipLabel('DELIVERED')).toBe('Delivered');
  });

  it('getStatusSeverity delegates to getOrderStatusSeverity', () => {
    createComponentWithRouteId('ord-1');
    expect(component.getStatusSeverity('CANCELLED')).toBe('status-cancelled');
    expect(component.getStatusSeverity('PENDING')).toBe('status-pending');
  });

  it('getPaySeverity delegates to getPaymentStatusSeverity', () => {
    createComponentWithRouteId('ord-1');
    expect(component.getPaySeverity('PAID')).toBe('status-paid');
  });

  it('getShipSeverity delegates to getShippingStatusSeverity', () => {
    createComponentWithRouteId('ord-1');
    expect(component.getShipSeverity('SHIPPED')).toBe('status-shipped');
  });

  // ─── Edge cases ────────────────────────────────────────

  it('updateStatus should do nothing when order is null', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(null);
    const spy = vi.spyOn(orderService, 'updateOrderStatus');
    component.updateStatus();
    expect(spy).not.toHaveBeenCalled();
  });

  it('updatePaymentStatusAction should do nothing when order is null', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(null);
    const spy = vi.spyOn(orderService, 'updatePaymentStatus');
    component.updatePaymentStatusAction();
    expect(spy).not.toHaveBeenCalled();
  });

  it('cancelOrder should do nothing when order is null', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(null);
    const spy = vi.spyOn(orderService, 'cancelOrder');
    component.cancelOrder();
    expect(spy).not.toHaveBeenCalled();
  });

  it('generateInvoice should do nothing when order is null', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(null);
    const spy = vi.spyOn(invoiceService, 'generateInvoice');
    component.generateInvoice();
    expect(spy).not.toHaveBeenCalled();
  });

  it('saveShipment should do nothing when order is null', () => {
    createComponentWithRouteId('ord-1');
    component.order.set(null);
    const spy = vi.spyOn(shipmentService, 'createShipment');
    component.saveShipment();
    expect(spy).not.toHaveBeenCalled();
  });
});
