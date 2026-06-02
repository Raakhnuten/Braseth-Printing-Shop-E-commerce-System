import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { OrderService } from '../../../core/services/order.service';
import { ShipmentService, CreateShipmentPayload } from '../../../core/services/shipment.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '../../../core/models/order.model';
import { ShipmentStatus } from '../../../core/models/shipping.model';
import { Invoice } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, RouterLink, DatePipe, CurrencyPipe, FormsModule],
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private shipmentService = inject(ShipmentService);
  private invoiceService = inject(InvoiceService);
  private destroyRef = inject(DestroyRef);

  pageTitle = 'Manage Orders';
  loading = signal(false);
  error = signal('');
  orders = signal<Order[]>([]);
  searchTerm = signal('');
  statusFilter = signal('');
  paymentFilter = signal('');
  shippingFilter = signal('');

  orderStatuses = Object.values(OrderStatus);
  paymentStatuses = Object.values(PaymentStatus);
  shippingStatuses = Object.values(ShippingStatus);

  selectedOrder = signal<Order | null>(null);
  showOrderDialog = signal(false);
  newStatus = signal('');
  statusMessage = signal('');

  showShipmentDialog = signal(false);
  shipmentOrderId = signal('');
  shipmentTracking = signal('');
  shipmentCarrier = signal('');
  shipmentMessage = signal('');

  filteredOrders = computed(() => {
    let result = this.orders();

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter((o) =>
        o.orderNumber.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.email.toLowerCase().includes(search)
      );
    }

    const status = this.statusFilter();
    if (status) result = result.filter((o) => o.status === status);

    const payment = this.paymentFilter();
    if (payment) result = result.filter((o) => o.paymentStatus === payment);

    const shipping = this.shippingFilter();
    if (shipping) result = result.filter((o) => o.shippingStatus === shipping);

    return result;
  });

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set('');
    this.orderService.getOrders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.orders.set(res.data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load orders'); this.loading.set(false); },
    });
  }

  openOrderDetail(order: Order): void {
    this.selectedOrder.set(order);
    this.newStatus.set(order.status);
    this.statusMessage.set('');
    this.showOrderDialog.set(true);
  }

  closeOrderDialog(): void { this.showOrderDialog.set(false); this.selectedOrder.set(null); }

  updateOrderStatus(): void {
    const order = this.selectedOrder();
    if (!order) return;
    this.orderService.updateOrderStatus(order.id, this.newStatus() as OrderStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.statusMessage.set(`Status updated to ${this.newStatus()}`);
        this.loadOrders();
      },
      error: () => this.statusMessage.set('Failed to update status'),
    });
  }

  openShipmentDialog(orderId: string): void {
    this.shipmentOrderId.set(orderId);
    this.shipmentTracking.set('');
    this.shipmentCarrier.set('');
    this.shipmentMessage.set('');
    this.showShipmentDialog.set(true);
  }

  closeShipmentDialog(): void { this.showShipmentDialog.set(false); }

  createShipment(): void {
    const order = this.orders().find((o) => o.id === this.shipmentOrderId());
    if (!order) return;
    const payload: CreateShipmentPayload = {
      orderId: order.id,
      shippingMethodId: order.shippingMethodId,
      shippingMethodName: order.shippingMethodName,
      shippingZoneId: order.shippingZoneId,
      shippingZoneName: order.shippingZoneName,
      trackingNumber: this.shipmentTracking() || undefined,
      carrierName: this.shipmentCarrier() || undefined,
    };
    this.shipmentService.createShipment(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.shipmentMessage.set('Shipment created successfully');
        this.closeShipmentDialog();
        this.loadOrders();
      },
      error: () => this.shipmentMessage.set('Failed to create shipment'),
    });
  }

  generateInvoice(orderId: string): void {
    this.invoiceService.generateInvoice(orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.loadOrders(); },
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/_/g, '-');
  }
}
