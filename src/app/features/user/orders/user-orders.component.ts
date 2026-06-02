import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import {
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getShippingStatusLabel,
  getOrderStatusSeverity,
  getPaymentStatusSeverity,
  getShippingStatusSeverity,
} from '../../../shared/utils/order-status.util';

type SortOrder = 'newest' | 'oldest';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrl: './user-orders.component.scss',
  imports: [PageHeaderComponent, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, DatePipe, CurrencyPipe, FormsModule],
})
export class UserOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal('');
  allOrders = signal<Order[]>([]);

  statusFilter = signal<string>('');
  searchQuery = signal('');
  sortOrder = signal<SortOrder>('newest');

  OrderStatus = OrderStatus;

  filteredOrders = computed(() => {
    let result = [...this.allOrders()];

    const status = this.statusFilter();
    if (status) {
      result = result.filter((o) => o.status === status);
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query),
      );
    }

    const sort = this.sortOrder();
    result.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === 'newest' ? db - da : da - db;
    });

    return result;
  });

  ngOnInit(): void {
    this.orderService.getMyOrders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.allOrders.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load orders. Please try again.');
        this.loading.set(false);
      },
    });
  }

  getStatusSeverity(status: string): string {
    return getOrderStatusSeverity(status as OrderStatus);
  }

  getPayStatusSeverity(status: string): string {
    return getPaymentStatusSeverity(status as any);
  }

  getShipStatusSeverity(status: string): string {
    return getShippingStatusSeverity(status as any);
  }

  getStatusLabel(status: string): string {
    return getOrderStatusLabel(status as OrderStatus);
  }

  getPayStatusLabel(status: string): string {
    return getPaymentStatusLabel(status as any);
  }

  getShipStatusLabel(status: string): string {
    return getShippingStatusLabel(status as any);
  }
}
