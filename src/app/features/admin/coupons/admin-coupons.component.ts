import { Component, DestroyRef, OnInit, signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DatePipe } from '@angular/common';
import { CouponService } from '../../../core/services/coupon.service';
import { Coupon, CouponDiscountType } from '../../../core/models/coupon.model';

@Component({
  selector: 'app-admin-coupons',
  templateUrl: './admin-coupons.component.html',
  styleUrl: './admin-coupons.component.scss',
  imports: [PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent, ReactiveFormsModule, DatePipe],
})
export class AdminCouponsComponent implements OnInit {
  private couponService = inject(CouponService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  pageTitle = 'Manage Coupons';

  loading = signal(true);
  error = signal('');
  coupons = signal<Coupon[]>([]);
  showForm = signal(false);
  formMode = signal<'create' | 'edit'>('create');
  editingId = signal<string | null>(null);
  submitted = signal(false);
  saving = signal(false);
  formError = signal('');
  successMessage = signal('');

  form: FormGroup = this.fb.group({
    code: ['', Validators.required],
    name: [''],
    description: [''],
    discountType: [CouponDiscountType.PERCENTAGE, Validators.required],
    discountValue: [0, [Validators.required, Validators.min(0)]],
    minOrderAmount: [null],
    maxUses: [null],
    startDate: [''],
    endDate: [''],
    enabled: [true],
  });

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading.set(true);
    this.error.set('');
    this.couponService.getCoupons().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.coupons.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load coupons');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.form.reset({ enabled: true, discountType: CouponDiscountType.PERCENTAGE, discountValue: 0, minOrderAmount: null, maxUses: null, startDate: '', endDate: '', code: '', name: '', description: '' });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('create');
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEditForm(coupon: Coupon): void {
    this.form.patchValue({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      enabled: coupon.enabled,
    });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('edit');
    this.editingId.set(coupon.id);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset({ enabled: true, discountType: CouponDiscountType.PERCENTAGE, discountValue: 0, minOrderAmount: null, maxUses: null, startDate: '', endDate: '', code: '', name: '', description: '' });
    this.formError.set('');
    this.submitted.set(false);
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.formError.set('');
    if (this.form.invalid) return;

    this.saving.set(true);
    const value = this.form.value;

    if (this.formMode() === 'create') {
      this.couponService.createCoupon(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Coupon created successfully');
          this.loadCoupons();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to create coupon');
        },
      });
    } else {
      this.couponService.updateCoupon(this.editingId()!, value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Coupon updated successfully');
          this.loadCoupons();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to update coupon');
        },
      });
    }
  }

  deleteCoupon(id: string): void {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    this.couponService.deleteCoupon(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.successMessage.set('Coupon deleted successfully');
        this.loadCoupons();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.formError.set('Failed to delete coupon');
      },
    });
  }

  getDiscountLabel(coupon: Coupon): string {
    switch (coupon.discountType) {
      case CouponDiscountType.PERCENTAGE:
        return `${coupon.discountValue}%`;
      case CouponDiscountType.FIXED:
        return `$${coupon.discountValue}`;
      case CouponDiscountType.FREE_SHIPPING:
        return 'Free';
      default:
        return `${coupon.discountValue}`;
    }
  }

  getDiscountTypeClass(type: CouponDiscountType): string {
    switch (type) {
      case CouponDiscountType.PERCENTAGE:
        return 'badge-blue';
      case CouponDiscountType.FIXED:
        return 'badge-purple';
      case CouponDiscountType.FREE_SHIPPING:
        return 'badge-green';
      default:
        return '';
    }
  }
}
