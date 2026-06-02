import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { isSafeUrl } from '../../../shared/utils/url.util';
import { OrderService } from '../../../core/services/order.service';
import { ShipmentService, CreateShipmentPayload } from '../../../core/services/shipment.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '../../../core/models/order.model';
import { Shipment, ShipmentStatus } from '../../../core/models/shipping.model';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.model';
import {
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getShippingStatusLabel,
  getOrderStatusSeverity,
  getPaymentStatusSeverity,
  getShippingStatusSeverity,
  canCancelOrder,
} from '../../../shared/utils/order-status.util';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, RouterLink, CurrencyPipe, DatePipe, FormsModule, SafeUrlPipe],
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private shipmentService = inject(ShipmentService);
  private invoiceService = inject(InvoiceService);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  error = signal('');
  order = signal<Order | null>(null);
  shipment = signal<Shipment | null>(null);
  invoice = signal<Invoice | null>(null);
  statusUpdateMessage = signal('');
  paymentUpdateMessage = signal('');

  orderStatuses = Object.values(OrderStatus);
  paymentStatuses = Object.values(PaymentStatus);

  selectedNewStatus = signal<OrderStatus>(OrderStatus.PENDING);
  selectedPaymentStatus = signal<PaymentStatus>(PaymentStatus.PENDING);

  // Shipment form
  showShipmentForm = signal(false);
  shipmentTracking = signal('');
  shipmentCarrier = signal('');
  shipmentMessage = signal('');

  get pageTitle(): string {
    const o = this.order();
    return o ? `Order ${o.orderNumber}` : 'Order Detail';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    } else {
      this.error.set('Order ID not found');
    }
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.statusUpdateMessage.set('');
    this.paymentUpdateMessage.set('');
    this.orderService.getOrderById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const o = res.data;
        this.order.set(o);
        if (o) {
          this.selectedNewStatus.set(o.status);
          this.selectedPaymentStatus.set(o.paymentStatus);
          this.loadShipment(id);
          this.loadInvoice(id);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load order details');
        this.loading.set(false);
      },
    });
  }

  private loadShipment(orderId: string): void {
    this.shipmentService.getShipmentByOrderId(orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => this.shipment.set(res.data || null),
    });
  }

  private loadInvoice(orderId: string): void {
    this.invoiceService.getInvoiceByOrderId(orderId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => this.invoice.set(res.data || null),
    });
  }

  updateStatus(): void {
    const current = this.order();
    if (!current) return;
    const newStatus = this.selectedNewStatus();
    this.orderService.updateOrderStatus(current.id, newStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.statusUpdateMessage.set(`Status updated to ${getOrderStatusLabel(newStatus)}`);
        this.loadOrder(current.id);
      },
      error: () => {
        this.statusUpdateMessage.set('Failed to update status');
      },
    });
  }

  updatePaymentStatusAction(): void {
    const current = this.order();
    if (!current) return;
    const newStatus = this.selectedPaymentStatus();
    this.orderService.updatePaymentStatus(current.id, newStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.paymentUpdateMessage.set(`Payment status updated to ${getPaymentStatusLabel(newStatus)}`);
        this.loadOrder(current.id);
      },
      error: () => {
        this.paymentUpdateMessage.set('Failed to update payment status');
      },
    });
  }

  cancelOrder(): void {
    const current = this.order();
    if (!current) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;
    this.orderService.cancelOrder(current.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.statusUpdateMessage.set('Order cancelled successfully');
        this.loadOrder(current.id);
      },
      error: () => {
        this.statusUpdateMessage.set('Failed to cancel order');
      },
    });
  }

  canCancel(): boolean {
    const o = this.order();
    return o !== null && canCancelOrder(o);
  }

  // ─── Shipment ─────────────────────────────────────────

  openShipmentForm(): void {
    this.showShipmentForm.set(true);
    const s = this.shipment();
    this.shipmentTracking.set(s?.trackingNumber ?? '');
    this.shipmentCarrier.set(s?.carrierName ?? '');
    this.shipmentMessage.set('');
  }

  closeShipmentForm(): void {
    this.showShipmentForm.set(false);
  }

  saveShipment(): void {
    const current = this.order();
    if (!current) return;

    const existing = this.shipment();
    if (existing) {
      // Update existing shipment tracking
      if (this.shipmentTracking()) {
        this.shipmentService.updateTrackingNumber(existing.id, this.shipmentTracking())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.shipmentMessage.set('Tracking updated');
              this.closeShipmentForm();
              this.loadShipment(current.id);
            },
            error: () => this.shipmentMessage.set('Failed to update tracking'),
          });
      }
      return;
    }

    // Create new shipment
    const payload: CreateShipmentPayload = {
      orderId: current.id,
      shippingMethodId: current.shippingMethodId,
      shippingMethodName: current.shippingMethodName,
      shippingZoneId: current.shippingZoneId,
      shippingZoneName: current.shippingZoneName,
      trackingNumber: this.shipmentTracking() || undefined,
      carrierName: this.shipmentCarrier() || undefined,
    };
    this.shipmentService.createShipment(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.shipmentMessage.set('Shipment created');
        this.closeShipmentForm();
        this.loadShipment(current.id);
      },
      error: () => this.shipmentMessage.set('Failed to create shipment'),
    });
  }

  // ─── Invoice ──────────────────────────────────────────

  generateInvoice(): void {
    const current = this.order();
    if (!current) return;
    this.invoiceService.generateInvoice(current.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadInvoice(current.id),
    });
  }

  markInvoicePaid(): void {
    const inv = this.invoice();
    if (!inv) return;
    this.invoiceService.markInvoicePaid(inv.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadInvoice(inv.orderId),
    });
  }

  openUrl(url: string | null): void {
    if (url && isSafeUrl(url)) {
      window.open(url, '_blank');
    }
  }

  // ─── Helpers ──────────────────────────────────────────

  getStatusSeverity(status: string): string {
    return getOrderStatusSeverity(status as OrderStatus);
  }

  getPaySeverity(status: string): string {
    return getPaymentStatusSeverity(status as PaymentStatus);
  }

  getShipSeverity(status: string): string {
    return getShippingStatusSeverity(status as ShippingStatus);
  }

  getStatusLabel(status: string): string {
    return getOrderStatusLabel(status as OrderStatus);
  }

  getPayLabel(status: string): string {
    return getPaymentStatusLabel(status as PaymentStatus);
  }

  getShipLabel(status: string): string {
    return getShippingStatusLabel(status as ShippingStatus);
  }
}
