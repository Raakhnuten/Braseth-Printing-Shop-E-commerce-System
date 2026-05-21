import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ReactiveFormsModule],
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  pageTitle = 'Manage Categories';
  loading = signal(false);
  error = signal('');
  categories = signal<Category[]>([]);
  showForm = signal(false);
  formMode = signal<'create' | 'edit'>('create');
  editingId = signal<string | null>(null);
  submitted = signal(false);
  saving = signal(false);
  formError = signal('');
  successMessage = signal('');

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    description: [''],
    imageUrl: [''],
    enabled: [true],
    sortOrder: [0],
    parentId: [null],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set('');
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.form.reset({ enabled: true, sortOrder: 0, parentId: null });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('create');
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEditForm(cat: Category): void {
    this.form.patchValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      enabled: cat.enabled,
      sortOrder: cat.sortOrder,
      parentId: cat.parentId,
    });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('edit');
    this.editingId.set(cat.id);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset({ enabled: true, sortOrder: 0, parentId: null });
    this.formError.set('');
    this.submitted.set(false);
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.formError.set('');
    if (this.form.invalid) return;

    this.saving.set(true);
    const value = this.form.value;

    if (this.formMode() === 'create') {
      this.categoryService.createCategory(value).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Category created successfully');
          this.loadCategories();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to create category');
        },
      });
    } else {
      this.categoryService.updateCategory(this.editingId()!, value).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Category updated successfully');
          this.loadCategories();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to update category');
        },
      });
    }
  }

  deleteCategory(id: string): void {
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.successMessage.set('Category deleted successfully');
        this.loadCategories();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.formError.set('Failed to delete category');
      },
    });
  }
}
