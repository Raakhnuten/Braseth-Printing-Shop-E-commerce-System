import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProductCustomizationService } from '../../../core/services/product-customization.service';
import { ProductFeatureControl } from '../../../core/models/customization.model';

@Component({
  selector: 'app-admin-feature-controls',
  templateUrl: './admin-feature-controls.component.html',
  styleUrl: './admin-feature-controls.component.scss',
  imports: [PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ReactiveFormsModule],
})
export class AdminFeatureControlsComponent implements OnInit {
  private customizationService = inject(ProductCustomizationService);
  private fb = inject(FormBuilder);

  pageTitle = 'Product Feature Controls';
  loading = signal(false);
  error = signal('');
  featureControls = signal<ProductFeatureControl[]>([]);
  showForm = signal(false);
  formMode = signal<'create' | 'edit'>('create');
  editingId = signal<string | null>(null);
  submitted = signal(false);
  saving = signal(false);
  formError = signal('');
  successMessage = signal('');

  form: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    isCustomizable: [false],
    enableSizeSelection: [false],
    enableColorSelection: [false],
    enableDesignUpload: [false],
    enableDecorationMethod: [false],
    enablePrintPosition: [false],
    enablePrintColor: [false],
    enablePriceBreak: [false],
    enableProductionTime: [false],
    enableCustomizationFee: [false],
    maxUploadFiles: [2],
    allowedFileTypes: [''],
    maxFileSizeMb: [5],
  });

  ngOnInit(): void {
    this.loadFeatureControls();
  }

  loadFeatureControls(): void {
    this.loading.set(true);
    this.error.set('');
    this.featureControls.set([]);

    const productIds = ['1', '6', 'default'];
    let loaded = 0;

    productIds.forEach((id) => {
      this.customizationService.getFeatureControl(id).subscribe({
        next: (res) => {
          if (res.data) {
            this.featureControls.update((controls) => [...controls, res.data!]);
          }
          loaded++;
          if (loaded === productIds.length) {
            this.loading.set(false);
          }
        },
        error: () => {
          loaded++;
          if (loaded === productIds.length) {
            this.loading.set(false);
          }
        },
      });
    });
  }

  openCreateForm(): void {
    this.form.reset({
      isCustomizable: false, enableSizeSelection: false, enableColorSelection: false,
      enableDesignUpload: false, enableDecorationMethod: false, enablePrintPosition: false,
      enablePrintColor: false, enablePriceBreak: false, enableProductionTime: false,
      enableCustomizationFee: false, maxUploadFiles: 2, allowedFileTypes: '', maxFileSizeMb: 5,
    });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('create');
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEditForm(fc: ProductFeatureControl): void {
    this.form.patchValue({
      productId: fc.productId,
      isCustomizable: fc.isCustomizable,
      enableSizeSelection: fc.enableSizeSelection,
      enableColorSelection: fc.enableColorSelection,
      enableDesignUpload: fc.enableDesignUpload,
      enableDecorationMethod: fc.enableDecorationMethod,
      enablePrintPosition: fc.enablePrintPosition,
      enablePrintColor: fc.enablePrintColor,
      enablePriceBreak: fc.enablePriceBreak,
      enableProductionTime: fc.enableProductionTime,
      enableCustomizationFee: fc.enableCustomizationFee,
      maxUploadFiles: fc.maxUploadFiles,
      allowedFileTypes: fc.allowedFileTypes.join(', '),
      maxFileSizeMb: fc.maxFileSizeMb,
    });
    this.submitted.set(false);
    this.formError.set('');
    this.formMode.set('edit');
    this.editingId.set(fc.id);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.formError.set('');
    this.submitted.set(false);
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.formError.set('');
    if (this.form.invalid) return;

    this.saving.set(true);
    const value = this.form.value;
    const payload = {
      productId: value.productId,
      isCustomizable: value.isCustomizable,
      enableSizeSelection: value.enableSizeSelection,
      enableColorSelection: value.enableColorSelection,
      enableDesignUpload: value.enableDesignUpload,
      enableDecorationMethod: value.enableDecorationMethod,
      enablePrintPosition: value.enablePrintPosition,
      enablePrintColor: value.enablePrintColor,
      enablePriceBreak: value.enablePriceBreak,
      enableProductionTime: value.enableProductionTime,
      enableCustomizationFee: value.enableCustomizationFee,
      maxUploadFiles: value.maxUploadFiles,
      allowedFileTypes: value.allowedFileTypes ? value.allowedFileTypes.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      maxFileSizeMb: value.maxFileSizeMb,
    };

    // TODO: Replace with real API call
    setTimeout(() => {
      this.saving.set(false);
      this.closeForm();
      this.successMessage.set('Feature control saved successfully');
      this.loadFeatureControls();
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 500);
  }

  getFeatureLabel(fc: ProductFeatureControl): string {
    const enabled: string[] = [];
    if (fc.enableSizeSelection) enabled.push('Size');
    if (fc.enableColorSelection) enabled.push('Color');
    if (fc.enableDecorationMethod) enabled.push('Decoration');
    if (fc.enableDesignUpload) enabled.push('Upload');
    if (fc.enablePrintPosition) enabled.push('Position');
    if (fc.enablePrintColor) enabled.push('Print Color');
    if (fc.enablePriceBreak) enabled.push('Price Break');
    if (fc.enableProductionTime) enabled.push('Production');
    if (fc.enableCustomizationFee) enabled.push('Fees');
    return enabled.length > 0 ? enabled.join(', ') : 'None';
  }
}
