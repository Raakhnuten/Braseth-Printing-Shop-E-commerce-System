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
import { PlatziAuthService } from './platzi-auth.service';
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
    removeAuthData();
  }

  refreshToken(): Observable<AuthResponse> {
    const token = getRefreshToken();
    if (!token) {
      return throwError(() => new Error('No refresh token available'));
    }
    // TODO: In production, the backend MUST validate the refresh token and return
    // a new access/refresh token pair. The current mock/fake implementation simply
    // returns the same tokens, which provides no real security benefit.
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
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

  // TODO: When the backend supports a token validation endpoint, this method
  // should delegate to it. Until then, it returns the current client-side state.
  // Do NOT rely on this for server-side authorization — backend must enforce
  // authorization on every protected API endpoint.
  validateSession(): Observable<ApiResponse<boolean>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of({ success: true, message: 'OK', data: this.isLoggedIn() });
    }
    // GET /auth/me — lightweight token validation
    return this.apiService.get<ApiResponse<AuthUser>>(API_ENDPOINTS.AUTH.ME).pipe(
      map(() => ({ success: true, message: 'OK', data: true })),
      catchError(() => of({ success: true, message: 'Session invalid', data: false })),
    );
  }

  validateAdminSession(): Observable<ApiResponse<boolean>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of({ success: true, message: 'OK', data: this.isAdmin() });
    }
    // GET /auth/me — lightweight token + role validation
    return this.apiService.get<ApiResponse<AuthUser>>(API_ENDPOINTS.AUTH.ME).pipe(
      map((res) => ({ success: true, message: 'OK', data: res.data?.role === UserRole.ADMIN })),
      catchError(() => of({ success: true, message: 'Not authorized', data: false })),
    );
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

  // TODO: Migrate to HttpOnly, Secure, SameSite cookies for production.
  // localStorage-based auth is vulnerable to XSS token theft and should be
  // replaced once the backend supports cookie-based authentication.
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
