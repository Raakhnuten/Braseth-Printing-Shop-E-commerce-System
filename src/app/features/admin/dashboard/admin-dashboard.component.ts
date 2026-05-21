import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Product } from '../../../core/models/product.model';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { MOCK_USERS } from '../../../mock-data/mock-users';

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

    this.productService.getProducts().subscribe({
      next: (prodRes) => {
        const products = prodRes.data || [];
        const lowStock = products.filter((p) => p.stockQuantity < 5);

        this.orderService.getOrders().subscribe({
          next: (orderRes) => {
            const orders = orderRes.data || [];
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
                value: MOCK_USERS.length.toString(),
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
      },
      error: () => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
      },
    });
  }
}
