import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-admin-invoices',
  templateUrl: './admin-invoices.component.html',
  styleUrl: './admin-invoices.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, DatePipe, CurrencyPipe, FormsModule],
})
export class AdminInvoicesComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private destroyRef = inject(DestroyRef);

  pageTitle = 'Manage Invoices';
  loading = signal(false);
  error = signal('');
  invoices = signal<Invoice[]>([]);
  searchTerm = signal('');
  statusFilter = signal('');

  invoiceStatuses = Object.values(InvoiceStatus);

  ngOnInit(): void { this.loadInvoices(); }

  loadInvoices(): void {
    this.loading.set(true);
    this.error.set('');
    this.invoiceService.getInvoices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.invoices.set(res.data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load invoices'); this.loading.set(false); },
    });
  }

  markPaid(invoiceId: string): void {
    this.invoiceService.markInvoicePaid(invoiceId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadInvoices(),
      error: () => this.error.set('Failed to mark as paid'),
    });
  }

  filteredInvoices = computed(() => {
    let result = this.invoices();
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter((i) =>
        i.invoiceNumber.toLowerCase().includes(search) ||
        i.customerName.toLowerCase().includes(search) ||
        i.customerEmail.toLowerCase().includes(search) ||
        i.orderId.toLowerCase().includes(search)
      );
    }
    const status = this.statusFilter();
    if (status) result = result.filter((i) => i.status === status);
    return result;
  });

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/_/g, '-');
  }
}
