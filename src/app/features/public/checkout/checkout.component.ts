import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { ShippingService } from '../../../core/services/shipping.service';
import { CartItem } from '../../../core/models/cart.model';
import { CheckoutRequest, OrderCreateRequest } from '../../../core/models/checkout.model';
import { ShippingMethod, ShippingZone } from '../../../core/models/shipping.model';

interface PaymentMethod {
  id: string;
  name: string;
  image: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  imports: [RouterLink, ReactiveFormsModule],
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected cartService = inject(CartService);
  protected checkoutService = inject(CheckoutService);
  private shippingService = inject(ShippingService);

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

  shippingMethods = signal<ShippingMethod[]>([]);
  shippingZones = signal<ShippingZone[]>([]);
  shippingLoading = signal(true);

  selectedShippingMethod = signal<ShippingMethod | null>(null);
  selectedShippingZone = signal<ShippingZone | null>(null);

  readonly paymentMethods: PaymentMethod[] = [
    { id: 'pay-to-store', name: 'Pay to Store', image: 'assets/images/payments/c3942570-ba21-4cca-90eb-c793b20308f4.webp', description: 'Direct payment at the store.', icon: 'pi-shop' },
    { id: 'cod', name: 'Cash on Delivery (COD)', image: 'assets/images/payments/257d7a8d-f349-46a7-a276-9c31df555287.webp', description: 'Pay after you get the item.', icon: 'pi-money-bill' },
    { id: 'bank-transfer', name: 'Direct Bank Transfer', image: 'assets/images/payments/31e26470-bc36-4605-b664-f69cce52ba02.webp', description: 'Direct transfer between local bank accounts.', icon: 'pi-building-columns' },
  ];

  selectedPayment = signal<PaymentMethod>(this.paymentMethods[1]);

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
    );
  });

  subtotal = computed(() => this.checkoutSummary().subtotal);
  total = computed(() => this.checkoutSummary().grandTotal);

  ngOnInit(): void {
    this.loadShippingOptions();
  }

  private loadShippingOptions(): void {
    this.shippingLoading.set(true);
    this.shippingService.getActiveShippingMethods().subscribe({
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

    this.shippingService.getActiveShippingZones().subscribe({
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

  updateQty(productId: string, qty: number): void { this.cartService.updateQuantity(productId, qty); }
  removeItem(productId: string): void { this.cartService.removeItem(productId); }

  getLineTotal(item: CartItem): number { return item.unitPrice * item.quantity; }

  getPaymentIcon(pm: PaymentMethod): string { return pm.icon; }

  onCartImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.png';
  }

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
      couponCode: null,
      items: this.cartItems(),
    };

    const orderPayload: OrderCreateRequest = this.checkoutService.buildOrderPayload(checkoutRequest);

    this.checkoutService.createOrder(orderPayload).subscribe({
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
        console.error('Failed to create order');
      },
    });
  }
}
