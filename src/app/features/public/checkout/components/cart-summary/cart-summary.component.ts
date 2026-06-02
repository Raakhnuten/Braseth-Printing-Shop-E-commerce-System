import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../../../../core/models/cart.model';

@Component({
  selector: 'app-cart-summary',
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.scss',
  imports: [RouterLink],
})
export class CartSummaryComponent {
  @Input({ required: true }) cartItems: CartItem[] = [];
  @Input({ required: true }) itemCount = 0;
  @Input({ required: true }) subtotal = 0;
  @Input({ required: true }) deliveryFee = 0;
  @Input({ required: true }) customizationFeeTotal = 0;
  @Input({ required: true }) discount = 0;
  @Input({ required: true }) total = 0;
  @Input({ required: true }) processing = false;

  @Output() updateQty = new EventEmitter<{ productId: string; quantity: number }>();
  @Output() removeItem = new EventEmitter<string>();
  @Output() placeOrder = new EventEmitter<void>();

  getLineTotal(item: CartItem): number {
    return item.unitPrice * item.quantity;
  }

  onCartImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.png';
  }
}
