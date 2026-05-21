import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = false;

  get user() {
    return this.authService.getCurrentUser();
  }

  get displayName(): string {
    const u = this.user;
    return u ? `${u.firstName} ${u.lastName}` : 'Admin';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
