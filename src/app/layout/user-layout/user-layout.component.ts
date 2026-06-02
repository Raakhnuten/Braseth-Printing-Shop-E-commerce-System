import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, FooterComponent],
})
export class UserLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get user() {
    return this.authService.getCurrentUser();
  }

  get displayName(): string {
    const u = this.user;
    return u ? `${u.firstName} ${u.lastName}` : 'User';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
