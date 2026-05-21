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
    localStorage.clear();
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