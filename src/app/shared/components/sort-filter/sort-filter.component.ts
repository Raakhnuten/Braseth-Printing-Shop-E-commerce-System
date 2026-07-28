import { Component, ChangeDetectionStrategy, inject, Input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

export type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';

export interface SortOptionItem {
  value: SortOption;
  label: string;
  icon: string;
}

export interface SortState {
  option: SortOption | null;
  label: string;
}

export interface FilterState {
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean | null;
}

const SORT_OPTIONS: SortOptionItem[] = [
  { value: 'price-asc', label: 'Price: Low to High', icon: 'pi-arrow-up' },
  { value: 'price-desc', label: 'Price: High to Low', icon: 'pi-arrow-down' },
  { value: 'newest', label: 'Newest First', icon: 'pi-clock' },
  { value: 'popular', label: 'Most Popular', icon: 'pi-fire' },
  { value: 'rating', label: 'Best Rating', icon: 'pi-star' },
];

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrl: './sort-filter.component.scss',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortFilterComponent {
  private fb = inject(FormBuilder);

  @Input() categories: string[] = [];

  readonly sortOptions = SORT_OPTIONS;

  sortState = signal<SortState>({ option: null, label: '' });
  filterState = signal<FilterState>({
    categories: [],
    priceMin: null,
    priceMax: null,
    inStock: null,
  });

  sortOverlayOpen = signal(false);
  filterOverlayOpen = signal(false);

  readonly sortChanged = output<SortState>();
  readonly filterChanged = output<FilterState>();

  filterForm = this.fb.group({
    priceMin: [''],
    priceMax: [''],
    inStock: [''],
  });

  selectedCategories = signal<string[]>([]);

  get filterCount(): number {
    const f = this.filterState();
    let count = 0;
    if (f.categories.length) count++;
    if (f.priceMin !== null || f.priceMax !== null) count++;
    if (f.inStock !== null) count++;
    return count;
  }

  get filterSubtitle(): string {
    const count = this.filterCount;
    if (count === 0) return 'No filter applied';
    return `${count} filter${count > 1 ? 's' : ''} applied`;
  }

  get sortSubtitle(): string {
    const label = this.sortState().label;
    return label || 'No sort applied';
  }

  openSortOverlay(): void {
    this.sortOverlayOpen.set(true);
  }

  closeSortOverlay(): void {
    this.sortOverlayOpen.set(false);
  }

  selectSortOption(option: SortOption): void {
    const item = SORT_OPTIONS.find((o) => o.value === option);
    const state: SortState = {
      option,
      label: item?.label ?? '',
    };
    this.sortState.set(state);
    this.sortChanged.emit(state);
    this.closeSortOverlay();
  }

  clearSort(): void {
    const state: SortState = { option: null, label: '' };
    this.sortState.set(state);
    this.sortChanged.emit(state);
    this.closeSortOverlay();
  }

  toggleCategory(cat: string): void {
    this.selectedCategories.update((list) => {
      if (list.includes(cat)) return list.filter((c) => c !== cat);
      return [...list, cat];
    });
  }

  openFilterOverlay(): void {
    const f = this.filterState();
    this.selectedCategories.set([...f.categories]);
    this.filterForm.patchValue({
      priceMin: f.priceMin !== null ? String(f.priceMin) : '',
      priceMax: f.priceMax !== null ? String(f.priceMax) : '',
      inStock: f.inStock === true ? 'true' : '',
    });
    this.filterOverlayOpen.set(true);
  }

  closeFilterOverlay(): void {
    this.filterOverlayOpen.set(false);
  }

  applyFilters(): void {
    const raw = this.filterForm.getRawValue();
    const state: FilterState = {
      categories: this.selectedCategories(),
      priceMin: raw.priceMin ? Number(raw.priceMin) : null,
      priceMax: raw.priceMax ? Number(raw.priceMax) : null,
      inStock: raw.inStock ? raw.inStock === 'true' : null,
    };
    this.filterState.set(state);
    this.filterChanged.emit(state);
    this.closeFilterOverlay();
  }

  resetFilters(): void {
    this.selectedCategories.set([]);
    this.filterForm.reset({ priceMin: '', priceMax: '', inStock: '' });
    const state: FilterState = {
      categories: [],
      priceMin: null,
      priceMax: null,
      inStock: null,
    };
    this.filterState.set(state);
    this.filterChanged.emit(state);
    this.closeFilterOverlay();
  }

  onOverlayClick(event: MouseEvent, overlayType: 'sort' | 'filter'): void {
    if ((event.target as HTMLElement).classList.contains('sf-overlay')) {
      if (overlayType === 'sort') this.closeSortOverlay();
      else this.closeFilterOverlay();
    }
  }

  trackByValue(_index: number, item: SortOptionItem): string {
    return item.value;
  }

  trackByCat(_index: number, item: string): string {
    return item;
  }
}
