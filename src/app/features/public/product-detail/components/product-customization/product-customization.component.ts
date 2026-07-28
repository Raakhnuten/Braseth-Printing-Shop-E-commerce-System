import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal } from '@angular/core';
import {
  ProductColor,
  ProductSize,
  DecorationMethod,
  PrintColor,
} from '../../../../../core/models/customization.model';

@Component({
  selector: 'app-product-customization',
  templateUrl: './product-customization.component.html',
  styleUrl: './product-customization.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCustomizationComponent {
  @Input() availableColors: ProductColor[] = [];
  @Input() availableSizes: ProductSize[] = [];
  @Input() availableDecorationMethods: DecorationMethod[] = [];
  @Input() availablePrintColors: PrintColor[] = [];

  @Output() sizeSelected = new EventEmitter<string>();
  @Output() colorSelected = new EventEmitter<string>();
  @Output() decorationSelected = new EventEmitter<string>();
  @Output() printColorsSelected = new EventEmitter<string[]>();
  @Output() multipleColorsChanged = new EventEmitter<boolean>();

  selectedSizeId = signal<string | null>(null);
  selectedColorId = signal<string | null>(null);
  selectedDecorationMethodId = signal<string | null>(null);
  selectedPrintColorIds = signal<string[]>([]);
  multipleColors = signal(false);

  get selectedDecorationMethod(): DecorationMethod | undefined {
    const id = this.selectedDecorationMethodId();
    return id ? this.availableDecorationMethods.find((m) => m.id === id) : undefined;
  }

  selectSize(sizeId: string): void {
    this.selectedSizeId.set(sizeId);
    this.sizeSelected.emit(sizeId);
  }

  selectColor(colorId: string): void {
    const cur = this.selectedColorId();
    const newVal = cur === colorId ? null : colorId;
    this.selectedColorId.set(newVal);
    this.colorSelected.emit(newVal ?? '');
  }

  selectDecoration(methodId: string): void {
    this.selectedDecorationMethodId.set(methodId);
    this.decorationSelected.emit(methodId);
  }

  togglePrintColor(colorId: string): void {
    const cur = this.selectedPrintColorIds();
    let updated: string[];
    if (cur.includes(colorId)) {
      updated = cur.filter((c) => c !== colorId);
    } else {
      updated = [...cur, colorId];
    }
    this.selectedPrintColorIds.set(updated);
    this.printColorsSelected.emit(updated);
  }

  toggleMultipleColors(): void {
    const newVal = !this.multipleColors();
    this.multipleColors.set(newVal);
    this.multipleColorsChanged.emit(newVal);
  }
}
