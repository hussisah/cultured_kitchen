import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:3000/orders';

  private auditUrl = 'http://localhost:3000/audit/sales';

  constructor(private http: HttpClient) {}


  // ==========================================
  // CREATE ORDER
  // ==========================================

  placeOrder(orderData: any) {

    return this.http.post(
      this.apiUrl,
      orderData
    );
  }


  // ==========================================
  // GET ACTIVE ORDERS
  // ==========================================

  getOrders(): Observable<any[]> {

    return this.http.get<any[]>(
      this.apiUrl
    );
  }


  // ==========================================
  // GET COMPLETE SALES AUDIT
  // CURRENT + ARCHIVED
  // ==========================================

  getSalesAudit(): Observable<any[]> {

    return this.http.get<any[]>(
      this.auditUrl
    );
  }


  // ==========================================
  // APPROVE ORDER
  // ==========================================

  approveOrder(id: number) {

    return this.http.put(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }


  // ==========================================
  // DECLINE ORDER
  // ==========================================

  declineOrder(id: number) {

    return this.http.put(
      `${this.apiUrl}/${id}/decline`,
      {}
    );
  }


  // ==========================================
  // DELETE / ARCHIVE ORDER
  // ==========================================

  deleteOrder(id: number) {

    const role =
      localStorage.getItem('adminRole') || '';

    const headers = new HttpHeaders({
      'x-admin-role': role
    });

    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers }
    );
  }
}