import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Order, OrderStatus, PaymentStatus, ShippingStatus, OrderItem } from '../../../core/models/order.model';
import { Shipment, ShipmentStatus } from '../../../core/models/shipping.model';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.model';
import { OrderService } from '../../../core/services/order.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { InvoiceService } from '../../../core/services/invoice.service';

@Component({
  selector: 'app-user-order-detail',
  templateUrl: './user-order-detail.component.html',
  styleUrl: './user-order-detail.component.scss',
  imports: [PageHeaderComponent, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, DatePipe, CurrencyPipe],
})
export class UserOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private shipmentService = inject(ShipmentService);
  private invoiceService = inject(InvoiceService);

  loading = signal(true);
  error = signal('');
  orderDetail = signal<Order | null>(null);
  shipment = signal<Shipment | null>(null);
  invoice = signal<Invoice | null>(null);

  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;
  ShippingStatus = ShippingStatus;
  ShipmentStatus = ShipmentStatus;
  InvoiceStatus = InvoiceStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(id).subscribe({
        next: (res) => {
          this.orderDetail.set(res.data || null);
          if (res.data) {
            this.loadShipment(id);
            this.loadInvoice(id);
          }
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load order details.');
          this.loading.set(false);
        },
      });
    } else {
      this.error.set('Order ID not found.');
      this.loading.set(false);
    }
  }

  private loadShipment(orderId: string): void {
    this.shipmentService.getShipmentByOrderId(orderId).subscribe({
      next: (res) => this.shipment.set(res.data || null),
    });
  }

  private loadInvoice(orderId: string): void {
    this.invoiceService.getInvoiceByOrderId(orderId).subscribe({
      next: (res) => this.invoice.set(res.data || null),
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/_/g, '-');
  }

  openUrl(url: string | null): void {
    if (url) window.open(url, '_blank');
  }
}
