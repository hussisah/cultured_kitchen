import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface Product {

  id: number;

  name: string;

  price: number;

  image: string;

  stock: number;

  category: string;

  description: string;

  created_at?: string;

  updated_at?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl =
    'http://localhost:3000/products';


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // GET ALL PRODUCTS
  // ==========================================

  getProducts():
    Observable<Product[]> {

    return this.http.get<Product[]>(
      this.apiUrl
    );

  }


  // ==========================================
  // ADD PRODUCT
  // CEO ONLY
  // ==========================================

  addProduct(product: {

    name: string;

    price: number;

    image: string;

    stock: number;

    category: string;

    description: string;

  }): Observable<Product> {

    return this.http.post<Product>(
      this.apiUrl,
      product,
      {
        headers:
          this.getCEOHeaders()
      }
    );

  }


  // ==========================================
  // DELETE PRODUCT
  // CEO ONLY
  // ==========================================

  deleteProduct(
    productId: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${productId}`,
      {
        headers:
          this.getCEOHeaders()
      }
    );

  }


  // ==========================================
  // ADD STOCK
  // CEO ONLY
  // ==========================================

  addStock(
    productId: number,
    amount: number
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.apiUrl}/${productId}/add-stock`,
      { amount },
      {
        headers:
          this.getCEOHeaders()
      }
    );

  }


  // ==========================================
  // REDUCE STOCK
  // CEO ONLY
  // ==========================================

  reduceStock(
    productId: number,
    amount: number
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.apiUrl}/${productId}/reduce-stock`,
      { amount },
      {
        headers:
          this.getCEOHeaders()
      }
    );

  }


  // ==========================================
  // CEO HEADERS
  // ==========================================

  private getCEOHeaders():
    HttpHeaders {

    const role =
      typeof window !== 'undefined'
        ? localStorage.getItem(
            'adminRole'
          ) || ''
        : '';

    return new HttpHeaders({
      'x-admin-role': role
    });

  }

}