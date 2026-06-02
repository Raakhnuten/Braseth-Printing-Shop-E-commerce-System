import { APP_CONFIG } from '../../core/constants/app-config';

export function getFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

export function clearStorage(): void {
  try {
    const appKeys = Object.values(APP_CONFIG.STORAGE_KEYS);
    appKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable
  }
}

export function getAuthToken(): string | null {
  return getFromStorage<string>(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
}

export function setAuthToken(token: string): void {
  setToStorage(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
}

export function removeAuthToken(): void {
  removeFromStorage(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
}

export function getRefreshToken(): string | null {
  return getFromStorage<string>(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token: string): void {
  setToStorage(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function removeRefreshToken(): void {
  removeFromStorage(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
}

export function getUserFromStorage<T = unknown>(): T | null {
  return getFromStorage<T>(APP_CONFIG.STORAGE_KEYS.USER);
}

export function setUserToStorage<T>(user: T): void {
  setToStorage(APP_CONFIG.STORAGE_KEYS.USER, user);
}

export function removeUserFromStorage(): void {
  removeFromStorage(APP_CONFIG.STORAGE_KEYS.USER);
}

export function removeAuthData(): void {
  removeAuthToken();
  removeRefreshToken();
  removeUserFromStorage();
}

// TODO: When backend supports HttpOnly, Secure, SameSite cookies, replace these
// localStorage-based helpers with cookie-based equivalents. The AuthService and
// auth interceptor should be updated to read tokens from cookies instead of storage.
// At that point, the client will no longer have direct access to auth tokens,
// eliminating the XSS token-theft attack surface (C-1).