import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { APP_CONFIG } from '../constants/app-config';
import { PlatziUser } from '../models/platzi/platzi-user.model';
import { PlatziLoginResponse } from '../models/platzi/platzi-auth.model';
import { AuthResponse } from '../models/auth.model';
import {
  mapPlatziLoginToAuthResponse,
  mapRegisterRequestToPlatziPayload,
  mapLoginRequestToPlatziPayload,
} from '../mappers/platzi-auth.mapper';
import { LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class PlatziAuthService {
  private readonly apiUrl = APP_CONFIG.PLATZI_API_BASE_URL;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const payload = mapLoginRequestToPlatziPayload(credentials);
    return this.http
      .post<PlatziLoginResponse>(`${this.apiUrl}/auth/login`, payload)
      .pipe(
        switchMap((tokenRes) =>
          this.http
            .get<PlatziUser>(`${this.apiUrl}/auth/profile`, {
              headers: { Authorization: `Bearer ${tokenRes.access_token}` },
            })
            .pipe(
              map((user) =>
                mapPlatziLoginToAuthResponse(tokenRes, user),
              ),
            ),
        ),
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    const payload = mapRegisterRequestToPlatziPayload(data);
    return this.http
      .post<PlatziUser>(`${this.apiUrl}/users`, payload)
      .pipe(
        switchMap((user) =>
          this.login({ email: data.email, password: data.password }),
        ),
      );
  }
}
