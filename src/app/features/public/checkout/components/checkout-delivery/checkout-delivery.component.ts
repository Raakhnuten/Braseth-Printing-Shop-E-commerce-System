import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ShippingMethod, ShippingZone } from '../../../../../core/models/shipping.model';

@Component({
  selector: 'app-checkout-delivery',
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.scss',
})
export class CheckoutDeliveryComponent {
  @Input({ required: true }) shippingMethods: ShippingMethod[] = [];
  @Input({ required: true }) shippingZones: ShippingZone[] = [];
  @Input() selectedMethod: ShippingMethod | null = null;
  @Input() selectedZone: ShippingZone | null = null;
  @Input({ required: true }) loading = false;

  @Output() selectMethod = new EventEmitter<ShippingMethod>();
  @Output() selectZone = new EventEmitter<ShippingZone>();
}
