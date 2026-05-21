import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  imports: [PageHeaderComponent, ReactiveFormsModule],
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  profileForm!: FormGroup;
  submitted = false;
  success = false;
  error = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', Validators.required],
      lastName: [user?.lastName || '', Validators.required],
      email: [{ value: user?.email || '', disabled: true }, [Validators.required, Validators.email]],
      phone: [user?.phone || ''],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.success = false;
    this.error = '';

    if (this.profileForm.invalid) return;

    // TODO: call AuthService or UserService update endpoint
    this.success = true;
  }
}