import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  imports: [PageHeaderComponent, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, DatePipe],
})
export class UserDashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal('');

  totalOrders = signal(0);
  totalSpent = signal(0);
  wishlistItems = signal(0);
  pendingOrders = signal(0);
  recentOrders = signal<Order[]>([]);

  get user() {
    return this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set('');

    this.orderService.getMyOrders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const orders = res.data || [];
        this.totalOrders.set(orders.length);
        this.totalSpent.set(orders.reduce((sum, o) => sum + o.grandTotal, 0));
        this.pendingOrders.set(
          orders.filter(
            (o) =>
              o.status === OrderStatus.PENDING ||
              o.status === OrderStatus.PROCESSING,
          ).length,
        );
        this.recentOrders.set(
          [...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3),
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
      },
    });
  }
}