import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { Address } from '../../../core/models/address.model';
import { AddressService } from '../../../core/services/address.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-user-addresses',
  templateUrl: './user-addresses.component.html',
  styleUrl: './user-addresses.component.scss',
  imports: [PageHeaderComponent, RouterLink, EmptyStateComponent, LoadingSpinnerComponent],
})
export class UserAddressesComponent implements OnInit {
  private addressService = inject(AddressService);
  private confirmService = inject(ConfirmDialogService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  error = signal('');
  addresses = signal<Address[]>([]);

  ngOnInit(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.loading.set(true);
    this.addressService.getAddresses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.addresses.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load addresses.');
        this.loading.set(false);
      },
    });
  }

  onDelete(id: string): void {
    this.confirmService.open({ title: 'Delete Address', message: 'Are you sure you want to delete this address?' })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.addressService.deleteAddress(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => this.loadAddresses(),
        });
      });
  }
}