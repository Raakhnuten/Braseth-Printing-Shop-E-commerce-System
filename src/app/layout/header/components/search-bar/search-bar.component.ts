import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  @Input() isOpen: boolean = false;
  @Output() searched = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();

  searchQuery = '';

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.searched.emit(q);
      this.searchQuery = '';
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.cleared.emit();
  }
}
