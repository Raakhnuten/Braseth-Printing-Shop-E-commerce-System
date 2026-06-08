import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface CategoryChip {
  id: string | number;
  name: string;
  icon?: string;
}

@Component({
  selector: 'app-category-chip',
  templateUrl: './category-chip.component.html',
  styleUrl: './category-chip.component.scss',
})
export class CategoryChipComponent {
  @Input({ required: true }) categories: CategoryChip[] = [];
  @Input() selectedId: string | number | null = null;
  @Input() compact = false;
  @Input() counts?: Record<string | number, number>;

  @Output() categorySelected = new EventEmitter<CategoryChip>();

  failedImages = new Set<string | number>();

  selectCategory(category: CategoryChip): void {
    this.categorySelected.emit(category);
  }

  onImageError(categoryId: string | number): void {
    this.failedImages.add(categoryId);
  }
}
