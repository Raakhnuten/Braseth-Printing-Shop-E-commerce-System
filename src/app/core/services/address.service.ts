import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Address } from '../models/address.model';
import { ApiResponse } from '../models/api-response.model';
import { APP_CONFIG } from '../constants/app-config';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly mockAddress: Address = {
    id: 'addr-1',
    userId: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    company: '',
    streetAddress: '123 Main St',
    apartment: '',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US',
    phone: '+1 555-0101',
    isDefault: true,
  };

  constructor(private apiService: ApiService) {}

  private ok<T>(data: T): ApiResponse<T> {
    return { success: true, message: 'OK', data };
  }

  getAddresses(): Observable<ApiResponse<Address[]>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of(this.ok([this.mockAddress]));
    }
    return this.apiService.get<ApiResponse<Address[]>>(API_ENDPOINTS.ADDRESSES.GET_ALL);
  }

  getAddressById(id: string): Observable<ApiResponse<Address | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      return of(this.ok(id === this.mockAddress.id ? this.mockAddress : null));
    }
    return this.apiService.get<ApiResponse<Address>>(API_ENDPOINTS.ADDRESSES.GET_BY_ID(id));
  }

  createAddress(address: Address): Observable<ApiResponse<Address | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      console.warn('[AddressService] createAddress not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.post<ApiResponse<Address>>(API_ENDPOINTS.ADDRESSES.CREATE, address);
  }

  updateAddress(id: string, address: Partial<Address>): Observable<ApiResponse<Address | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      console.warn('[AddressService] updateAddress not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.put<ApiResponse<Address>>(API_ENDPOINTS.ADDRESSES.UPDATE(id), address);
  }

  deleteAddress(id: string): Observable<ApiResponse<void | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      console.warn('[AddressService] deleteAddress not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.delete<ApiResponse<void>>(API_ENDPOINTS.ADDRESSES.DELETE(id));
  }

  setDefaultAddress(id: string): Observable<ApiResponse<Address | null>> {
    if (APP_CONFIG.USE_MOCK_DATA ) {
      console.warn('[AddressService] setDefaultAddress not supported in mock/fake data mode');
      return of(this.ok(null));
    }
    return this.apiService.post<ApiResponse<Address>>(API_ENDPOINTS.ADDRESSES.SET_DEFAULT(id), {});
  }

  getShippingAddress(): Address {
    return this.mockAddress;
  }
}
