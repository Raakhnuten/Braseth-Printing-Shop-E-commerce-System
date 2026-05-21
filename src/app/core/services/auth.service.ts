import { Injectable, signal, computed } from '@angular/core';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import {
  AuthUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../models/auth.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_USERS } from '../../mock-data/mock-users';
import { PlatziAuthService } from './platzi-auth.service';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = signal<AuthUser | null>(this.loadUserFromStorage());

  readonly currentUser = this.currentUserSubject.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSubject());
  readonly isAdmin = computed(() => this.currentUserSubject()?.role === UserRole.ADMIN);

  constructor(
    private apiService: ApiService,
    private platziAuth: PlatziAuthService,
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const source$ = this.pickLoginSource(credentials);
    return source$.pipe(
      tap((res) => {
        this.currentUserSubject.set(res.user);
        this.saveUserToStorage(res);
      }),
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    const source$ = this.pickRegisterSource(data);
    return source$.pipe(
      tap((res) => {
        this.currentUserSubject.set(res.user);
        this.saveUserToStorage(res);
      }),
    );
  }

  logout(): void {
    if (!APP_CONFIG.USE_MOCK_DATA && !APP_CONFIG.USE_FAKE_API) {
      this.apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {}).subscribe({
        error: () => {},
      });
    }
    this.currentUserSubject.set(null);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject();
  }

  private pickLoginSource(credentials: LoginRequest): Observable<AuthResponse> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const mockUser = MOCK_USERS.find((u) => u.email === credentials.email);
      const authUser: AuthUser = {
        id: mockUser?.id ?? 'mock-id',
        firstName: mockUser?.firstName ?? 'John',
        lastName: mockUser?.lastName ?? 'Doe',
        email: credentials.email,
        phone: mockUser?.phone ?? '',
        role: mockUser?.role ?? UserRole.CUSTOMER,
        enabled: true,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      };
      return of({ user: authUser, token: 'mock-jwt-token', refreshToken: 'mock-refresh-token', expiresIn: 3600 });
    }
    if (APP_CONFIG.USE_FAKE_API) {
      return this.platziAuth.login(credentials);
    }
    return this.apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  private pickRegisterSource(data: RegisterRequest): Observable<AuthResponse> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      const authUser: AuthUser = {
        id: 'mock-id',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: UserRole.CUSTOMER,
        enabled: true,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      };
      return of({ user: authUser, token: 'mock-jwt-token', refreshToken: 'mock-refresh-token', expiresIn: 3600 });
    }
    if (APP_CONFIG.USE_FAKE_API) {
      return this.platziAuth.register(data);
    }
    return this.apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  private saveUserToStorage(authResponse: AuthResponse): void {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, authResponse.token);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(authResponse.user));
    } catch {
      // Storage unavailable
    }
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const userStr = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
      if (token && userStr) {
        return JSON.parse(userStr);
      }
    } catch {
      // Storage unavailable
    }
    return null;
  }
}
