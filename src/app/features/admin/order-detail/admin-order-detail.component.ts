import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, RouterLink, CurrencyPipe],
})
export class AdminOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');
  order = signal<Order | null>(null);
  statusUpdateMessage = signal('');

  orderStatuses = Object.values(OrderStatus);

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
    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load order details');
        this.loading.set(false);
      },
    });
  }

  updateStatus(newStatus: string): void {
    const current = this.order();
    if (!current) return;
    this.orderService.updateOrderStatus(current.id, newStatus as OrderStatus).subscribe({
      next: () => {
        this.statusUpdateMessage.set(`Status updated to ${newStatus}`);
        this.loadOrder(current.id);
      },
      error: () => {
        this.statusUpdateMessage.set('Failed to update status');
      },
    });
  }

  cancelOrder(): void {
    const current = this.order();
    if (!current) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;
    this.orderService.cancelOrder(current.id).subscribe({
      next: () => {
        this.statusUpdateMessage.set('Order cancelled successfully');
        this.loadOrder(current.id);
      },
      error: () => {
        this.statusUpdateMessage.set('Failed to cancel order');
      },
    });
  }
}
