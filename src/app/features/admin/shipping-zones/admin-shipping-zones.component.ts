import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ShippingService } from '../../../core/services/shipping.service';
import { ShippingZone } from '../../../core/models/shipping.model';

@Component({
  selector: 'app-admin-shipping-zones',
  templateUrl: './admin-shipping-zones.component.html',
  styleUrl: './admin-shipping-zones.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ReactiveFormsModule],
})
export class AdminShippingZonesComponent implements OnInit {
  private shippingService = inject(ShippingService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  pageTitle = 'Manage Shipping Zones';
  loading = signal(false);
  error = signal('');
  shippingZones = signal<ShippingZone[]>([]);
  showForm = signal(false);
  formMode = signal<'create' | 'edit'>('create');
  editingId = signal<string | null>(null);
  submitted = signal(false);
  saving = signal(false);
  formError = signal('');
  successMessage = signal('');

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: [''],
    fee: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
    sortOrder: [0],
  });

  ngOnInit(): void {
    this.loadShippingZones();
  }

  loadShippingZones(): void {
    this.loading.set(true);
    this.error.set('');
    this.shippingService.getShippingZones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.shippingZones.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load shipping zones');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.form.reset({ isActive: true, sortOrder: 0, description: '', fee: 0 });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('create');
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEditForm(zone: ShippingZone): void {
    this.form.patchValue({
      name: zone.name,
      code: zone.code,
      description: zone.description,
      fee: zone.fee,
      isActive: zone.isActive,
      sortOrder: zone.sortOrder,
    });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('edit');
    this.editingId.set(zone.id);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset({ isActive: true, sortOrder: 0, description: '', fee: 0 });
    this.formError.set('');
    this.submitted.set(false);
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.formError.set('');
    if (this.form.invalid) return;

    this.saving.set(true);
    const value = this.form.value;
    const payload = {
      name: value.name,
      code: value.code,
      description: value.description,
      fee: value.fee,
      isActive: value.isActive,
      sortOrder: value.sortOrder,
    };

    if (this.formMode() === 'create') {
      this.shippingService.createShippingZone(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Shipping zone created successfully');
          this.loadShippingZones();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to create shipping zone');
        },
      });
    } else {
      this.shippingService.updateShippingZone(this.editingId()!, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Shipping zone updated successfully');
          this.loadShippingZones();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to update shipping zone');
        },
      });
    }
  }

  toggleActive(zone: ShippingZone): void {
    this.shippingService.updateShippingZone(zone.id, { isActive: !zone.isActive }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.successMessage.set(`Shipping zone ${zone.isActive ? 'deactivated' : 'activated'}`);
        this.loadShippingZones();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.formError.set('Failed to update shipping zone');
      },
    });
  }

  deleteShippingZone(id: string): void {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return;
    this.shippingService.deleteShippingZone(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.successMessage.set('Shipping zone deleted successfully');
        this.loadShippingZones();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.formError.set('Failed to delete shipping zone');
      },
    });
  }
}
