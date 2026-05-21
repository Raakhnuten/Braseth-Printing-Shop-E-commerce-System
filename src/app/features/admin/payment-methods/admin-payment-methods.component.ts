import { Component, OnInit, inject, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { PaymentMethod, PaymentMethodType } from '../../../core/models/payment-method.model';

@Component({
  selector: 'app-admin-payment-methods',
  templateUrl: './admin-payment-methods.component.html',
  styleUrl: './admin-payment-methods.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ReactiveFormsModule, LowerCasePipe],
})
export class AdminPaymentMethodsComponent implements OnInit {
  private paymentMethodService = inject(PaymentMethodService);
  private fb = inject(FormBuilder);

  pageTitle = 'Manage Payment Methods';
  loading = signal(false);
  error = signal('');
  paymentMethods = signal<PaymentMethod[]>([]);
  showForm = signal(false);
  formMode = signal<'create' | 'edit'>('create');
  editingId = signal<string | null>(null);
  submitted = signal(false);
  saving = signal(false);
  formError = signal('');
  successMessage = signal('');

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    type: [PaymentMethodType.CARD, Validators.required],
    enabled: [true],
    sortOrder: [0],
    configDetails: [''],
  });

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.loading.set(true);
    this.error.set('');
    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (res) => {
        this.paymentMethods.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load payment methods');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.form.reset({ enabled: true, type: PaymentMethodType.CARD, sortOrder: 0, description: '', configDetails: '' });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('create');
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEditForm(pm: PaymentMethod): void {
    this.form.patchValue({
      name: pm.name,
      description: pm.description,
      type: pm.type,
      enabled: pm.enabled,
      sortOrder: pm.sortOrder,
      configDetails: pm.config?.metadata ? JSON.stringify(pm.config.metadata, null, 2) : '',
    });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('edit');
    this.editingId.set(pm.id);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset({ enabled: true, type: PaymentMethodType.CARD, sortOrder: 0, description: '', configDetails: '' });
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
      description: value.description,
      type: value.type,
      enabled: value.enabled,
      sortOrder: value.sortOrder,
      config: {
        metadata: value.configDetails ? { notes: value.configDetails } : undefined,
      },
    };

    if (this.formMode() === 'create') {
      this.paymentMethodService.createPaymentMethod(payload as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Payment method created successfully');
          this.loadPaymentMethods();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to create payment method');
        },
      });
    } else {
      this.paymentMethodService.updatePaymentMethod(this.editingId()!, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Payment method updated successfully');
          this.loadPaymentMethods();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to update payment method');
        },
      });
    }
  }

  deletePaymentMethod(id: string): void {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    this.paymentMethodService.deletePaymentMethod(id).subscribe({
      next: () => {
        this.successMessage.set('Payment method deleted successfully');
        this.loadPaymentMethods();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.formError.set('Failed to delete payment method');
      },
    });
  }
}
