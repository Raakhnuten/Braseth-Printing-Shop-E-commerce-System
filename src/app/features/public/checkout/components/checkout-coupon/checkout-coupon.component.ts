import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CouponMessage {
  text: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-checkout-coupon',
  templateUrl: './checkout-coupon.component.html',
  styleUrl: './checkout-coupon.component.scss',
  imports: [FormsModule],
})
export class CheckoutCouponComponent {
  @Input() couponCode: string | null = null;
  @Input() message: CouponMessage | null = null;

  @Output() applyCoupon = new EventEmitter<string>();
  @Output() removeCoupon = new EventEmitter<void>();

  inputCode = '';

  apply(): void {
    if (this.inputCode.trim()) {
      this.applyCoupon.emit(this.inputCode.trim());
    }
  }
}
