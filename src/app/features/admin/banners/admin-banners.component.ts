import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BannerService } from '../../../core/services/banner.service';
import { Banner, BannerPosition } from '../../../core/models/banner.model';

@Component({
  selector: 'app-admin-banners',
  templateUrl: './admin-banners.component.html',
  styleUrl: './admin-banners.component.scss',
  imports: [PageHeaderComponent, EmptyStateComponent, LoadingSpinnerComponent, ReactiveFormsModule],
})
export class AdminBannersComponent implements OnInit {
  private bannerService = inject(BannerService);
  private fb = inject(FormBuilder);

  pageTitle = 'Manage Banners';

  loading = signal(true);
  error = signal('');
  banners = signal<Banner[]>([]);
  showForm = signal(false);
  formMode = signal<'create' | 'edit'>('create');
  editingId = signal<string | null>(null);
  submitted = signal(false);
  saving = signal(false);
  formError = signal('');
  successMessage = signal('');

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    subtitle: [''],
    imageUrl: ['', Validators.required],
    linkUrl: [''],
    linkText: [''],
    position: [BannerPosition.HERO],
    enabled: [true],
    sortOrder: [0],
    startsAt: [''],
    endsAt: [''],
  });

  bannerPositions = Object.values(BannerPosition);

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.loading.set(true);
    this.error.set('');
    this.bannerService.getBanners().subscribe({
      next: (res) => {
        this.banners.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load banners');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.form.reset({ title: '', subtitle: '', imageUrl: '', linkUrl: '', linkText: '', position: BannerPosition.HERO, enabled: true, sortOrder: 0, startsAt: '', endsAt: '' });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('create');
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEditForm(banner: Banner): void {
    this.form.patchValue({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      linkText: banner.linkText,
      position: banner.position,
      enabled: banner.enabled,
      sortOrder: banner.sortOrder,
      startsAt: banner.startsAt,
      endsAt: banner.endsAt,
    });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('edit');
    this.editingId.set(banner.id);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset({ title: '', subtitle: '', imageUrl: '', linkUrl: '', linkText: '', position: BannerPosition.HERO, enabled: true, sortOrder: 0, startsAt: '', endsAt: '' });
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
      this.bannerService.createBanner(value).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Banner created successfully');
          this.loadBanners();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to create banner');
        },
      });
    } else {
      this.bannerService.updateBanner(this.editingId()!, value).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeForm();
          this.successMessage.set('Banner updated successfully');
          this.loadBanners();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.saving.set(false);
          this.formError.set('Failed to update banner');
        },
      });
    }
  }

  deleteBanner(id: string): void {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    this.bannerService.deleteBanner(id).subscribe({
      next: () => {
        this.successMessage.set('Banner deleted successfully');
        this.loadBanners();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: () => {
        this.formError.set('Failed to delete banner');
      },
    });
  }
}
