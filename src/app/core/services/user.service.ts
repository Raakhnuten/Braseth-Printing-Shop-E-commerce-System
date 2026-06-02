import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { MOCK_USERS } from '../../mock-data/mock-users';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private apiService: ApiService) {}

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data };
  }

  getUsers(): Observable<ApiResponse<User[]>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      return of(this.ok(MOCK_USERS));
    }
    return this.apiService.get<ApiResponse<User[]>>(API_ENDPOINTS.USERS.GET_ALL);
  }

  getUserById(id: string): Observable<ApiResponse<User | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      const user = MOCK_USERS.find((u) => u.id === id) ?? null;
      return of(this.ok(user));
    }
    return this.apiService.get<ApiResponse<User>>(API_ENDPOINTS.USERS.GET_BY_ID(id));
  }

  updateUser(id: string, user: Partial<User>): Observable<ApiResponse<User | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[UserService] updateUser not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.put<ApiResponse<User>>(API_ENDPOINTS.USERS.UPDATE(id), user);
  }

  deleteUser(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA || APP_CONFIG.USE_FAKE_API) {
      console.warn('[UserService] deleteUser not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.USERS.DELETE(id));
  }
}
