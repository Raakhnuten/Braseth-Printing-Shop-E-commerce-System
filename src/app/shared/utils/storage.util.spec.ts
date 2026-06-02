import { APP_CONFIG } from '../../core/constants/app-config';
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  getUserFromStorage,
  setUserToStorage,
  removeUserFromStorage,
  removeAuthData,
  clearStorage,
  getFromStorage,
  setToStorage,
  removeFromStorage,
} from './storage.util';

describe('storage.util', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('general helpers', () => {
    it('should store and retrieve a value', () => {
      setToStorage('test-key', { foo: 'bar' });
      expect(getFromStorage('test-key')).toEqual({ foo: 'bar' });
    });

    it('should return null for missing keys', () => {
      expect(getFromStorage('nonexistent')).toBeNull();
    });

    it('should remove a value', () => {
      setToStorage('test-key', 'value');
      removeFromStorage('test-key');
      expect(getFromStorage('test-key')).toBeNull();
    });
  });

  describe('auth token helpers', () => {
    it('should store and retrieve auth token', () => {
      setAuthToken('test-token-123');
      expect(getAuthToken()).toBe('test-token-123');
    });

    it('should remove auth token', () => {
      setAuthToken('test-token');
      removeAuthToken();
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('refresh token helpers', () => {
    it('should store and retrieve refresh token', () => {
      setRefreshToken('refresh-token-456');
      expect(getRefreshToken()).toBe('refresh-token-456');
    });

    it('should remove refresh token', () => {
      setRefreshToken('refresh-token');
      removeRefreshToken();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('user storage helpers', () => {
    it('should store and retrieve user object', () => {
      const user = { id: '1', name: 'Test', role: 'ADMIN' };
      setUserToStorage(user);
      expect(getUserFromStorage()).toEqual(user);
    });

    it('should remove user from storage', () => {
      setUserToStorage({ id: '1' });
      removeUserFromStorage();
      expect(getUserFromStorage()).toBeNull();
    });
  });

  describe('removeAuthData', () => {
    it('should remove all auth-related keys', () => {
      setAuthToken('token');
      setRefreshToken('refresh');
      setUserToStorage({ id: '1' });

      removeAuthData();

      expect(getAuthToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(getUserFromStorage()).toBeNull();
    });
  });

  describe('clearStorage', () => {
    it('should remove only app-specific keys', () => {
      localStorage.setItem('other-app-key', 'should-remain');
      setAuthToken('token');
      setToStorage(APP_CONFIG.STORAGE_KEYS.CART, ['item1']);
      setToStorage(APP_CONFIG.STORAGE_KEYS.WISHLIST, ['prod1']);

      clearStorage();

      // App keys are removed
      expect(getAuthToken()).toBeNull();
      expect(getFromStorage(APP_CONFIG.STORAGE_KEYS.CART)).toBeNull();
      expect(getFromStorage(APP_CONFIG.STORAGE_KEYS.WISHLIST)).toBeNull();
      // Non-app keys remain
      expect(localStorage.getItem('other-app-key')).toBe('should-remain');
    });
  });
});
