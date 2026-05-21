import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterComponent],
})
export class UserLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = false;

  get user() {
    return this.authService.getCurrentUser();
  }

  get displayName(): string {
    const u = this.user;
    return u ? `${u.firstName} ${u.lastName}` : 'User';
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