import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Product } from '../../../core/models/product.model';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { UserService } from '../../../core/services/user.service';

interface StatCard {
  icon: string;
  label: string;
  value: string;
  colorClass: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  imports: [PageHeaderComponent, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, DatePipe],
})
export class AdminDashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  pageTitle = 'Dashboard';

  loading = signal(true);
  error = signal('');

  stats = signal<StatCard[]>([]);
  recentOrders = signal<Order[]>([]);
  recentProducts = signal<Product[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      products: this.productService.getProducts(),
      orders: this.orderService.getOrders(),
      users: this.userService.getUsers(),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const products = res.products.data || [];
        const orders = res.orders.data || [];
        const users = res.users.data || [];
        const lowStock = products.filter((p) => p.stockQuantity < 5);
        const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
        const pendingOrders = orders.filter(
          (o) =>
            o.status === OrderStatus.PENDING ||
            o.status === OrderStatus.PROCESSING,
        ).length;

        this.recentOrders.set(
          [...orders]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 5),
        );

        this.recentProducts.set(
          [...products]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 5),
        );

        this.stats.set([
          {
            icon: 'pi pi-box',
            label: 'Total Products',
            value: products.length.toString(),
            colorClass: 'stat-card--blue',
          },
          {
            icon: 'pi pi-shopping-cart',
            label: 'Total Orders',
            value: orders.length.toString(),
            colorClass: 'stat-card--green',
          },
          {
            icon: 'pi pi-users',
            label: 'Total Users',
            value: users.length.toString(),
            colorClass: 'stat-card--purple',
          },
          {
            icon: 'pi pi-dollar',
            label: 'Total Revenue',
            value: `$${totalRevenue.toFixed(2)}`,
            colorClass: 'stat-card--amber',
          },
          {
            icon: 'pi pi-clock',
            label: 'Pending Orders',
            value: pendingOrders.toString(),
            colorClass: 'stat-card--orange',
          },
          {
            icon: 'pi pi-exclamation-triangle',
            label: 'Low Stock Products',
            value: lowStock.length.toString(),
            colorClass: 'stat-card--red',
          },
        ]);

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
      },
    });
  }
}
