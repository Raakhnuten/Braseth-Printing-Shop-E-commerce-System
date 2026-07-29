import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { switchMap, EMPTY } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { ShippingService } from '../../../core/services/shipping.service';
import { CartItem } from '../../../core/models/cart.model';
import { CheckoutRequest, OrderCreateRequest } from '../../../core/models/checkout.model';
import { ShippingMethod, ShippingZone } from '../../../core/models/shipping.model';
import { CartSummaryComponent } from './components/cart-summary/cart-summary.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { CheckoutCouponComponent, CouponMessage } from './components/checkout-coupon/checkout-coupon.component';
import { CheckoutDeliveryComponent } from './components/checkout-delivery/checkout-delivery.component';

interface PaymentMethod {
  id: string;
  name: string;
  image?: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  imports: [RouterLink, ReactiveFormsModule, CartSummaryComponent, AddressFormComponent, CheckoutCouponComponent, CheckoutDeliveryComponent],
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected cartService = inject(CartService);
  protected checkoutService = inject(CheckoutService);
  private shippingService = inject(ShippingService);
  private destroyRef = inject(DestroyRef);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telegram: ['', Validators.required],
    address: ['', Validators.required],
    note: [''],
  });

  submitted = signal(false);
  orderSuccess = signal(false);
  orderNumber = signal('');
  processing = signal(false);

  couponCode = signal<string | null>(null);
  couponMessage = signal<CouponMessage | null>(null);

  orderValidationErrors = signal<string[]>([]);
  submitError = signal<string | null>(null);

  shippingMethods = signal<ShippingMethod[]>([]);
  shippingZones = signal<ShippingZone[]>([]);
  shippingLoading = signal(true);

  selectedShippingMethod = signal<ShippingMethod | null>(null);
  selectedShippingZone = signal<ShippingZone | null>(null);

  readonly paymentMethods: PaymentMethod[] = [
    { id: 'cod', name: 'Cash on Delivery (COD)', description: 'Pay after you get the item.', icon: 'pi-money-bill' },
    { id: 'bank-transfer', name: 'Direct Bank Transfer', image: 'assets/images/payments/image.png', description: 'Direct transfer between local bank accounts.', icon: 'pi-building-columns' },
  ];

  selectedPayment = signal<PaymentMethod>(this.paymentMethods[0]);

  cartItems = computed(() => this.cartService.items());
  itemCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));

  deliveryFee = computed(() => {
    const method = this.selectedShippingMethod();
    const zone = this.selectedShippingZone();
    if (!method) return 0;
    return this.shippingService.calculateDeliveryFee(method.id, zone?.id ?? null);
  });

  checkoutSummary = computed(() => {
    const items = this.cartItems();
    if (items.length === 0) {
      return { subtotal: 0, discount: 0, deliveryFee: 0, customizationFeeTotal: 0, tax: 0, grandTotal: 0, totalItems: 0 };
    }
    return this.checkoutService.calculateCheckoutSummary(
      items,
      this.deliveryFee(),
      this.couponCode(),
    );
  });

  subtotal = computed(() => this.checkoutSummary().subtotal);
  discount = computed(() => this.checkoutSummary().discount);
  total = computed(() => this.checkoutSummary().grandTotal);

  ngOnInit(): void {
    this.loadShippingOptions();
  }

  private loadShippingOptions(): void {
    this.shippingLoading.set(true);
    this.shippingService.getActiveShippingMethods().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.shippingMethods.set(res.data);
        if (res.data.length > 0) {
          this.selectedShippingMethod.set(res.data[0]);
        }
        this.shippingLoading.set(false);
      },
      error: () => {
        this.shippingLoading.set(false);
      },
    });

    this.shippingService.getActiveShippingZones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.shippingZones.set(res.data);
        if (res.data.length > 0) {
          this.selectedShippingZone.set(res.data[0]);
        }
      },
    });
  }

  selectShippingMethod(method: ShippingMethod): void {
    this.selectedShippingMethod.set(method);
  }

  selectShippingZone(zone: ShippingZone): void {
    this.selectedShippingZone.set(zone);
  }

  selectPayment(method: PaymentMethod): void { this.selectedPayment.set(method); }

  applyCoupon(code: string): void {
    if (!code || !code.trim()) return;
    this.checkoutService.validateCoupon(code.trim()).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (res) => {
        if (res.data?.valid) {
          this.couponCode.set(res.data.code);
          this.couponMessage.set({ text: res.data.message, type: 'success' });
        } else {
          this.couponCode.set(null);
          this.couponMessage.set({ text: res.data?.message ?? 'Invalid coupon', type: 'error' });
        }
      },
      error: () => {
        this.couponMessage.set({ text: 'Failed to validate coupon', type: 'error' });
      },
    });
  }

  removeCoupon(): void {
    this.couponCode.set(null);
    this.couponMessage.set(null);
  }

  updateQty(productId: string, qty: number): void { this.cartService.updateQuantity(productId, qty); }
  removeItem(productId: string): void { this.cartService.removeItem(productId); }

  onPaymentImgError(event: Event): void {
    const el = event.target as HTMLImageElement;
    el.style.display = 'none';
  }

  placeOrder(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    if (this.cartItems().length === 0) return;
    if (!this.selectedShippingMethod()) return;

    this.processing.set(true);
    this.orderValidationErrors.set([]);
    this.submitError.set(null);

    const method = this.selectedShippingMethod()!;
    const zone = this.selectedShippingZone();

    const checkoutRequest: CheckoutRequest = {
      customer: {
        name: this.form.value.name ?? '',
        email: this.form.value.email ?? '',
        phone: '',
        telegramUsername: this.form.value.telegram ?? '',
        address: this.form.value.address ?? '',
        note: this.form.value.note ?? '',
      },
      shipping: {
        shippingMethodId: method.id,
        shippingMethodName: method.name,
        shippingZoneId: zone?.id ?? null,
        shippingZoneName: zone?.name ?? null,
        deliveryFee: this.deliveryFee(),
      },
      payment: {
        paymentMethodId: this.selectedPayment().id,
        paymentMethodName: this.selectedPayment().name,
      },
      couponCode: this.couponCode(),
      items: this.cartItems(),
    };

    const orderPayload: OrderCreateRequest = this.checkoutService.buildOrderPayload(checkoutRequest);

    // Validate order before submission — the backend (or mock fallback) checks
    // all prices, discounts, fees, and tax. If validation fails, the order is
    // not submitted and validation errors are shown in the UI.
    // The validation result contains a `serverPrices` block with the backend's
    // authoritative totals.
    this.checkoutService.validateOrderBeforeCreate(orderPayload).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((validation) => {
        if (!validation.data?.valid) {
          const errors = validation.data?.errors ?? ['Please review your order details and try again.'];
          this.processing.set(false);
          this.orderValidationErrors.set(errors);
          return EMPTY;
        }
        return this.checkoutService.createOrder(orderPayload);
      }),
    ).subscribe({
      next: (response) => {
        this.orderNumber.set(response.data?.orderNumber ?? '');
        this.cartService.clearCart();
        this.orderSuccess.set(true);
        this.processing.set(false);
        this.submitted.set(false);
        this.form.reset();
      },
      error: () => {
        this.processing.set(false);
        this.submitError.set('An unexpected error occurred. Please try again.');
      },
    });
  }
}
