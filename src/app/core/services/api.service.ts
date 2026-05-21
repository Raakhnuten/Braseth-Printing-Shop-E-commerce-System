import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../constants/app-config';

type HttpParamsInit = { [param: string]: string | number | boolean | readonly (string | number | boolean)[] } | HttpParams;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = APP_CONFIG.API_BASE_URL.replace(/\/+$/, '');
  }

  get<T>(path: string, params?: HttpParamsInit): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: this.toParams(params) });
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body ?? {});
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body ?? {});
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body ?? {});
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }

  private toParams(params?: HttpParamsInit): HttpParams | undefined {
    if (!params) return undefined;
    if (params instanceof HttpParams) return params;
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        filtered[key] = String(value);
      }
    }
    return Object.keys(filtered).length ? new HttpParams({ fromObject: filtered }) : undefined;
  }
}
