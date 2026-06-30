import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../../services/store';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  stockAmount = 1;
  reduceAmount = 1;
  newUsername = '';
  newPassword = '';

  orders: any[] = [];

  newProduct = {
    id: 0,
    name: '',
    price: 0,
    image: '',
    stock: 0,
    category: '',
    description: ''
  };

  constructor(
    public storeService: StoreService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();

    // Auto refresh every 3 seconds
    setInterval(() => {
      this.loadOrders();
    }, 3000);
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data: any) => {
        this.orders = [...data];
        this.cdr.detectChanges(); // force refresh
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  approveOrder(id: number) {
    this.orderService.approveOrder(id).subscribe(() => {
      this.loadOrders();
    });
  }

  declineOrder(id: number) {
    this.orderService.declineOrder(id).subscribe(() => {
      this.loadOrders();
    });
  }

  addNewProduct() {
    this.newProduct.id =
      this.storeService.products.length + 1;

    this.storeService.addProduct({
      ...this.newProduct
    });

    this.newProduct = {
      id: 0,
      name: '',
      price: 0,
      image: '',
      stock: 0,
      category: '',
      description: ''
    };
  }

  addStock(productId: number) {
    this.storeService.addStock(productId, this.stockAmount);
  }

  reduceStock(productId: number) {
    this.storeService.reduceStock(productId, this.reduceAmount);
  }

  deleteProduct(productId: number) {
    this.storeService.deleteProduct(productId);
  }

  addSalesPerson() {
    this.storeService.addSalesPerson(
      this.newUsername,
      this.newPassword
    );
  }

  deleteSalesPerson(index: number) {
    this.storeService.deleteSalesPerson(index);
  }

  deleteOrder(id: number) {
  this.orderService.deleteOrder(id).subscribe(() => {
    this.loadOrders();
  });
}

  logout() {
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin-login';
  }
}