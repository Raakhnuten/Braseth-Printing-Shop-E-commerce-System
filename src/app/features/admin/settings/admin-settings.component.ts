import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss',
  imports: [PageHeaderComponent, ReactiveFormsModule],
})
export class AdminSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);

  pageTitle = 'Settings';
  submitted = false;
  successMessage = signal('');

  settingsForm = this.fb.group({
    storeName: ['', Validators.required],
    storeEmail: ['', [Validators.required, Validators.email]],
    storePhone: [''],
    currency: ['USD', Validators.required],
    freeShippingThreshold: [0, [Validators.min(0)]],
    flatShippingRate: [0, [Validators.min(0)]],
    taxPercentage: [0, [Validators.min(0), Validators.max(100)]],
  });

  ngOnInit(): void {
    // Settings form initialized
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.settingsForm.invalid) return;
    this.successMessage.set('Settings saved successfully.');
  }
}
