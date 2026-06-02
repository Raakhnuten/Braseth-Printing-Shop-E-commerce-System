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
  passwordForm!: FormGroup;
  submitted = false;
  pwSubmitted = false;
  success = false;
  pwSuccess = false;
  error = '';
  pwError = '';

  get user() {
    return this.authService.getCurrentUser();
  }

  get fullName(): string {
    const u = this.user;
    return u ? `${u.firstName} ${u.lastName}` : '';
  }

  get initials(): string {
    const u = this.user;
    if (!u) return 'U';
    return (u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '');
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', Validators.required],
      lastName: [user?.lastName || '', Validators.required],
      email: [{ value: user?.email || '', disabled: true }, [Validators.required, Validators.email]],
      phone: [user?.phone || ''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
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

  onChangePassword(): void {
    this.pwSubmitted = true;
    this.pwSuccess = false;
    this.pwError = '';

    if (this.passwordForm.invalid) return;

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.pwError = 'Passwords do not match.';
      return;
    }

    // TODO: call AuthService change password endpoint
    this.pwSuccess = true;
    this.passwordForm.reset();
    this.pwSubmitted = false;
  }
}
