import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../../core/models/cart.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  imports: [RouterLink],
})
export class CartComponent {
  protected cartService = inject(CartService);

  items = computed(() => this.cartService.items());
  cartSummary = computed(() => this.cartService.getCart());

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  updateQty(itemId: string, qty: number): void {
    this.cartService.updateQuantity(this.items().find((i) => i.id === itemId)?.productId ?? itemId, qty);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  getItemLineTotal(item: CartItem): number {
    return item.unitPrice * item.quantity;
  }
}
