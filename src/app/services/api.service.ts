import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  placeOrder(order: any) {
    return this.http.post(
      `${this.apiUrl}/orders`,
      order
    );
  }

  getOrders() {
    return this.http.get(
      `${this.apiUrl}/orders`
    );
  }

  approveOrder(id: number) {
    return this.http.put(
      `${this.apiUrl}/orders/${id}/approve`,
      {}
    );
  }

  declineOrder(id: number) {
    return this.http.put(
      `${this.apiUrl}/orders/${id}/decline`,
      {}
    );
  }
}