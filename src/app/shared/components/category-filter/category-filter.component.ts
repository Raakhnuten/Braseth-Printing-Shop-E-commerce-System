import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Category } from '../../../core/models/category.model';

export interface CategoryFilterItem {
  id: string | null;
  name: string;
}

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilterComponent {
  readonly categories = input<Category[]>([]);
  readonly selectedCategoryId = input<string | null>(null);
  readonly loading = input(false);

  readonly categoryChange = output<string | null>();

  private readonly allItem: CategoryFilterItem = { id: null, name: 'All' };

  readonly filterItems = computed<CategoryFilterItem[]>(() => {
    const cats = this.categories();
    return [this.allItem, ...cats.map((c) => ({ id: c.id, name: c.name }))];
  });

  selectCategory(item: CategoryFilterItem): void {
    this.categoryChange.emit(item.id);
  }

  trackById(_index: number, item: CategoryFilterItem): string | null {
    return item.id;
  }
}
