import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { UserRole } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: { get: () => {}, post: () => {}, put: () => {}, delete: () => {} } },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should set currentUser signal with valid credentials', async () => {
      const res = await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      expect(res.user).toBeDefined();
      expect(res.user.email).toBe('john.doe@example.com');
      expect(res.user.firstName).toBe('John');
      expect(res.user.lastName).toBe('Doe');
      expect(res.user.role).toBe(UserRole.CUSTOMER);
    });

    it('should store token in localStorage after login', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      const storedToken = localStorage.getItem('seth_store_auth_token');
      expect(storedToken).not.toBeNull();
      expect(JSON.parse(storedToken!)).toBe('mock-jwt-token');
    });

    it('should store user in localStorage after login', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      const storedUser = localStorage.getItem('seth_store_user');
      expect(storedUser).not.toBeNull();
      const user = JSON.parse(storedUser!);
      expect(user.email).toBe('john.doe@example.com');
    });
  });

  describe('logout', () => {
    it('should clear currentUser to null', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      service.logout();
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should remove auth data from storage', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      service.logout();
      expect(localStorage.getItem('seth_store_auth_token')).toBeNull();
      expect(localStorage.getItem('seth_store_refresh_token')).toBeNull();
      expect(localStorage.getItem('seth_store_user')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true after login', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false initially when no stored user', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false after logout', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );
      service.logout();

      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role user', async () => {
      await firstValueFrom(
        service.login({ email: 'admin@example.com', password: 'password123' }),
      );

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for CUSTOMER role user', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      expect(service.isAdmin()).toBe(false);
    });

    it('should return false when not logged in', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null initially', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return user after login', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      const user = service.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user!.email).toBe('john.doe@example.com');
    });
  });

  describe('register', () => {
    it('should create user with correct data', async () => {
      const res = await firstValueFrom(
        service.register({
          firstName: 'Alice',
          lastName: 'Wonder',
          email: 'alice@example.com',
          phone: '+1 555-0200',
          password: 'password123',
          confirmPassword: 'password123',
        }),
      );

      expect(res.user.firstName).toBe('Alice');
      expect(res.user.lastName).toBe('Wonder');
      expect(res.user.email).toBe('alice@example.com');
      expect(res.user.role).toBe(UserRole.CUSTOMER);
    });

    it('should set currentUser after registration', async () => {
      await firstValueFrom(
        service.register({
          firstName: 'Alice',
          lastName: 'Wonder',
          email: 'alice@example.com',
          phone: '+1 555-0200',
          password: 'password123',
          confirmPassword: 'password123',
        }),
      );

      expect(service.isLoggedIn()).toBe(true);
      expect(service.getCurrentUser()!.email).toBe('alice@example.com');
    });
  });

  describe('refreshToken', () => {
    it('should return current user data in mock mode', async () => {
      await firstValueFrom(
        service.login({ email: 'john.doe@example.com', password: 'password123' }),
      );

      const res = await firstValueFrom(service.refreshToken());
      expect(res.token).toBe('mock-jwt-token');
      expect(res.refreshToken).toBe('mock-refresh-token');
      expect(res.user.email).toBe('john.doe@example.com');
    });
  });
});
