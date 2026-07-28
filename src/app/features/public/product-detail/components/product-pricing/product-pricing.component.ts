import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import {
  ProductFeatureControl,
  ProductPriceBreak,
  ProductProductionTime,
} from '../../../../../core/models/customization.model';
import { CustomizationTotal } from '../../../../../core/services/product-customization.service';

@Component({
  selector: 'app-product-pricing',
  templateUrl: './product-pricing.component.html',
  styleUrl: './product-pricing.component.scss',
  imports: [FormsModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPricingComponent {
  @Input() priceBreaks: ProductPriceBreak[] = [];
  @Input() productionTime: ProductProductionTime | null = null;
  @Input() basePrice: number = 0;
  @Input() featureControl: ProductFeatureControl | null = null;
  @Input() customizationSummary: CustomizationTotal | null = null;

  @Output() quantityChanged = new EventEmitter<number>();

  customQty = signal(24);
  showPriceBreaks = signal(false);

  get enablePriceBreak(): boolean {
    return this.featureControl?.enablePriceBreak ?? false;
  }

  get enableProductionTime(): boolean {
    return this.featureControl?.enableProductionTime ?? false;
  }

  get minOrderQuantity(): number {
    if (this.enablePriceBreak && this.priceBreaks.length > 0) {
      return this.priceBreaks[0].minQuantity;
    }
    return 1;
  }

  get estimatedUnitPrice(): number {
    return this.customizationSummary?.unitPrice ?? this.basePrice;
  }

  get estimatedTotal(): number {
    return this.customizationSummary?.totalPrice ?? this.basePrice * this.customQty();
  }

  get productionDays(): number {
    return this.customizationSummary?.productionDays ?? this.productionTime?.maxDays ?? 0;
  }

  adjustQty(delta: number): void {
    const minQty = this.minOrderQuantity;
    const n = this.customQty() + delta;
    if (n >= minQty) {
      this.customQty.set(n);
      this.quantityChanged.emit(n);
    }
  }

  setQty(value: number): void {
    const minQty = this.minOrderQuantity;
    const newVal = value < minQty ? minQty : value;
    this.customQty.set(newVal);
    this.quantityChanged.emit(newVal);
  }
}
