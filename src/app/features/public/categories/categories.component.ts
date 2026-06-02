import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  imports: [RouterLink, LoadingSpinnerComponent],
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);

  categories = signal<Category[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.categories.set(res.data || []);
      this.loading.set(false);
    });
  }
}
