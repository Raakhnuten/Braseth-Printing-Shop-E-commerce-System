import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
import { ApiResponse } from '../models/api-response.model';
import { MOCK_USERS } from '../../mock-data/mock-users';
import { ApiService } from './api.service';
import {
  getAuthToken,
  getRefreshToken,
  getUserFromStorage,
  setAuthToken,
  setRefreshToken,
  setUserToStorage,
  removeAuthData,
} from '../../shared/utils/storage.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = signal<AuthUser | null>(this.loadUserFromStorage());

  readonly currentUser = this.currentUserSubject.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSubject());
  readonly isAdmin = computed(() => this.currentUserSubject()?.role === UserRole.ADMIN);

  constructor(private apiService: ApiService) {}

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
    if (!APP_CONFIG.USE_MOCK_DATA) {
      this.apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {}).subscribe({
        error: () => {},
      });
    }
    this.currentUserSubject.set(null);
    removeAuthData();
  }

  refreshToken(): Observable<AuthResponse> {
    const token = getRefreshToken();
    if (!token) {
      return throwError(() => new Error('No refresh token available'));
    }
    if (APP_CONFIG.USE_MOCK_DATA) {
      const user = this.currentUserSubject();
      return of({
        user: user ?? { id: '', firstName: '', lastName: '', email: '', phone: '', role: '', enabled: false, token: '', refreshToken: '', expiresIn: 0 },
        token: user?.token ?? 'mock-jwt-token',
        refreshToken: user?.refreshToken ?? 'mock-refresh-token',
        expiresIn: 3600,
      });
    }
    return this.apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken: token }).pipe(
      tap((res) => this.saveUserToStorage(res)),
    );
  }

  validateSession(): Observable<ApiResponse<boolean>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return of({ success: true, message: 'OK', data: this.isLoggedIn() });
    }
    return this.apiService.get<ApiResponse<AuthUser>>(API_ENDPOINTS.AUTH.ME).pipe(
      map(() => ({ success: true, message: 'OK', data: true })),
      catchError(() => of({ success: true, message: 'Session invalid', data: false })),
    );
  }

  validateAdminSession(): Observable<ApiResponse<boolean>> {
    if (APP_CONFIG.USE_MOCK_DATA) {
      return of({ success: true, message: 'OK', data: this.isAdmin() });
    }
    return this.apiService.get<ApiResponse<AuthUser>>(API_ENDPOINTS.AUTH.ME).pipe(
      map((res) => ({ success: true, message: 'OK', data: res.data?.role === UserRole.ADMIN })),
      catchError(() => of({ success: true, message: 'Not authorized', data: false })),
    );
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject();
  }

  // >>> API CONNECTION: Auth endpoints
  //     USE_MOCK_DATA=false → POST /api/auth/login
  //     USE_MOCK_DATA=false → POST /api/auth/register
  //     USE_MOCK_DATA=false → POST /api/auth/refresh <<<
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
    // >>> API CONNECTION: POST /api/auth/login <<<
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
    // >>> API CONNECTION: POST /api/auth/register <<<
    return this.apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  }

  private saveUserToStorage(authResponse: AuthResponse): void {
    try {
      setAuthToken(authResponse.token);
      setRefreshToken(authResponse.refreshToken);
      setUserToStorage(authResponse.user);
    } catch {
      // Storage unavailable
    }
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const token = getAuthToken();
      const user = getUserFromStorage<AuthUser>();
      if (token && user) {
        return user;
      }
    } catch {
      // Storage unavailable
    }
    return null;
  }
}
