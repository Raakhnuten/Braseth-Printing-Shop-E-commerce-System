import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { APP_CONFIG } from '../constants/app-config';
import { PlatziProduct } from '../models/platzi/platzi-product.model';
import { mapPlatziProductToProduct } from '../mappers/platzi-product.mapper';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class PlatziProductService {
  private readonly apiUrl = APP_CONFIG.PLATZI_API_BASE_URL;

  constructor(private http: HttpClient) {}

  getProducts(offset = 0, limit = 20): Observable<Product[]> {
    return this.http
      .get<PlatziProduct[]>(`${this.apiUrl}/products`, {
        params: { offset, limit },
      })
      .pipe(map((list) => list.map(mapPlatziProductToProduct)));
  }

  getProductById(id: string): Observable<Product> {
    return this.http
      .get<PlatziProduct>(`${this.apiUrl}/products/${id}`)
      .pipe(map(mapPlatziProductToProduct));
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http
      .get<PlatziProduct[]>(`${this.apiUrl}/products`, {
        params: { categoryId },
      })
      .pipe(map((list) => list.map(mapPlatziProductToProduct)));
  }

  searchProducts(title: string): Observable<Product[]> {
    return this.http
      .get<PlatziProduct[]>(`${this.apiUrl}/products`, {
        params: { title },
      })
      .pipe(map((list) => list.map(mapPlatziProductToProduct)));
  }
}
