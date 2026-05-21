import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ShippingService } from '../../../core/services/shipping.service';
import { ShippingMethod } from '../../../core/models/shipping.model';

@Component({
  selector: 'app-admin-shipping-methods',
  templateUrl: './admin-shipping-methods.component.html',
  styleUrl: './admin-shipping-methods.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ReactiveFormsModule],
})
export class AdminShippingMethodsComponent implements OnInit {
  private shippingService = inject(ShippingService);
  private fb = inject(FormBuilder);

  pageTitle = 'Manage Shipping Methods';
  loading = signal(false);
  error = signal('');
  shippingMethods = signal<ShippingMethod[]>([]);
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
    baseFee: [0, [Validators.required, Validators.min(0)]],
    estimatedDeliveryTime: ['', Validators.required],
    isActive: [true],
    sortOrder: [0],
  });

  ngOnInit(): void {
    this.loadShippingMethods();
  }

  loadShippingMethods(): void {
    this.loading.set(true);
    this.error.set('');
    this.shippingService.getShippingMethods().subscribe({
      next: (res) => {
        this.shippingMethods.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load shipping methods');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.form.reset({ isActive: true, sortOrder: 0, description: '', baseFee: 0, estimatedDeliveryTime: '' });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('create');
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEditForm(method: ShippingMethod): void {
    this.form.patchValue({
      name: method.name,
      code: method.code,
      description: method.description,
      baseFee: method.baseFee,
      estimatedDeliveryTime: method.estimatedDeliveryTime,
      isActive: method.isActive,
      sortOrder: method.sortOrder,
    });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('edit');
    this.editingId.set(method.id);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset({ isActive: true, sortOrder: 0, description: '', baseFee: 0, estimatedDeliveryTime: '' });
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
      baseFee: value.baseFee,
      estimatedDeliveryTime: value.estimatedDeliveryTime,
      isActive: value.isActive,
      sortOrder: value.sortOrder,
    };

    if (this.formMode() === 'create') {
      this.shippingService.createShippingMethod(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Shipping method created successfully');
          this.loadShippingMethods();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to create shipping method');
        },
      });
    } else {
      this.shippingService.updateShippingMethod(this.editingId()!, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Shipping method updated successfully');
          this.loadShippingMethods();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to update shipping method');
        },
      });
    }
  }

  toggleActive(method: ShippingMethod): void {
    this.shippingService.updateShippingMethod(method.id, { isActive: !method.isActive }).subscribe({
      next: () => {
        this.successMessage.set(`Shipping method ${method.isActive ? 'deactivated' : 'activated'}`);
        this.loadShippingMethods();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.formError.set('Failed to update shipping method');
      },
    });
  }

  deleteShippingMethod(id: string): void {
    if (!confirm('Are you sure you want to delete this shipping method?')) return;
    this.shippingService.deleteShippingMethod(id).subscribe({
      next: () => {
        this.successMessage.set('Shipping method deleted successfully');
        this.loadShippingMethods();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.formError.set('Failed to delete shipping method');
      },
    });
  }
}
