import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/orders';

  constructor(private http: HttpClient) {}

  // Create order
  placeOrder(orderData: any) {
    return this.http.post(this.apiUrl, orderData);
  }

  // Get all orders
  getOrders() {
    return this.http.get(this.apiUrl);
  }

  // Approve order
  approveOrder(id: number) {
    return this.http.put(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }

  // Decline order
  declineOrder(id: number) {
    return this.http.put(
      `${this.apiUrl}/${id}/decline`,
      {}
    );
  }
  //delete order
   deleteOrder(id: number) {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}