import { Component, signal, computed, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  imports: [PageHeaderComponent, EmptyStateComponent, FormsModule],
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  pageTitle = 'Manage Users';

  loading = signal(true);
  searchQuery = signal('');
  roleFilter = signal<'ALL' | 'CUSTOMER' | 'ADMIN'>('ALL');
  statusFilter = signal<'ALL' | 'enabled' | 'disabled'>('ALL');

  users = signal<User[]>([]);

  ngOnInit(): void {
    this.userService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.users.set(res.data || []);
      this.loading.set(false);
    });
  }

  filteredUsers = computed(() => {
    let result = this.users();

    const search = this.searchQuery().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search),
      );
    }

    const role = this.roleFilter();
    if (role !== 'ALL') {
      result = result.filter((u) => u.role === role);
    }

    const status = this.statusFilter();
    if (status === 'enabled') {
      result = result.filter((u) => u.enabled);
    } else if (status === 'disabled') {
      result = result.filter((u) => !u.enabled);
    }

    return result;
  });

  editUser(user: User): void {
    alert('Edit user - to be implemented');
  }
}
