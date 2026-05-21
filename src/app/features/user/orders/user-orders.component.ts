import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrl: './user-orders.component.scss',
  imports: [PageHeaderComponent, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, DatePipe, CurrencyPipe],
})
export class UserOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  loading = signal(true);
  orders = signal<Order[]>([]);

  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;
  ShippingStatus = ShippingStatus;

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/_/g, '-');
  }
}
