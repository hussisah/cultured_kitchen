import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  products: Product[] = [
    {
      id: 1,
      name: 'Premium Cookware Set',
      price: 45000,
      image: 'assets/images/cookware.jpg',
      stock: 10,
      category: 'Kitchen',
      description: 'POTS'
    },
    {
      id: 2,
      name: 'Decorative Plate Set',
      price: 18000,
      image: 'assets/images/plates.jpg',
      stock: 15,
      category: 'Dining',
      description: 'plates'
    },
    {
      id: 3,
      name: 'Plate Rack',
      price: 12000,
      image: 'assets/images/platerack.jpg',
      stock: 8,
      category: 'Souvenirs',
      description: 'plate rack'
    }
  ];

  cart: any[] = [];
  orders: any[] = [];
  soldProducts: { [key: string]: number } = {};

  salesPeople: any[] = [];

  constructor() {
    const savedSales = localStorage.getItem('salesPeople');

    this.salesPeople = savedSales
      ? JSON.parse(savedSales)
      : [
          {
            username: 'sales1',
            password: 'sales123'
          }
        ];
  }

  getProducts() {
    return this.products;
  }

  addProduct(product: Product) {
    this.products.push(product);
  }

  deleteProduct(productId: number) {
    this.products = this.products.filter(
      product => product.id !== productId
    );
  }

  addStock(productId: number, amount: number) {
    const product = this.products.find(
      product => product.id === productId
    );

    if (product) {
      product.stock += amount;
    }
  }

  reduceStock(productId: number, amount: number) {
    const product = this.products.find(
      product => product.id === productId
    );

    if (product && product.stock >= amount) {
      product.stock -= amount;
    } else {
      alert('Not enough stock');
    }
  }

  addToCart(product: Product) {
    const existingItem = this.cart.find(
      item => item.id === product.id
    );

    if (product.stock > 0) {
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.cart.push({
          ...product,
          quantity: 1
        });
      }

      product.stock--;

      this.soldProducts[product.name] =
        (this.soldProducts[product.name] || 0) + 1;
    } else {
      alert('Out of stock');
    }
  }

  getCart() {
    return this.cart;
  }

  increaseQuantity(index: number) {
    const item = this.cart[index];
    const product = this.products.find(
      p => p.id === item.id
    );

    if (product && product.stock > 0) {
      item.quantity++;
      product.stock--;
    }
  }

  decreaseQuantity(index: number) {
    const item = this.cart[index];
    const product = this.products.find(
      p => p.id === item.id
    );

    if (item.quantity > 1) {
      item.quantity--;
      if (product) product.stock++;
    } else {
      this.removeFromCart(index);
    }
  }

  removeFromCart(index: number) {
    const item = this.cart[index];
    const product = this.products.find(
      p => p.id === item.id
    );

    if (product) {
      product.stock += item.quantity;
    }

    this.cart.splice(index, 1);
  }

  getTotal() {
    return this.cart.reduce(
      (total, item) =>
        total + (item.price * item.quantity),
      0
    );
  }

  getRole(): string {
    return localStorage.getItem('adminRole') || '';
  }

  isCEO(): boolean {
    return this.getRole().trim() === 'CEO';
  }

  isSales(): boolean {
    return this.getRole().trim() === 'SALES';
  }

  getSalesAnalytics() {
    return this.soldProducts;
  }

  addSalesPerson(username: string, password: string) {
    this.salesPeople.push({
      username,
      password
    });

    localStorage.setItem(
      'salesPeople',
      JSON.stringify(this.salesPeople)
    );
  }

  deleteSalesPerson(index: number) {
    this.salesPeople.splice(index, 1);

    localStorage.setItem(
      'salesPeople',
      JSON.stringify(this.salesPeople)
    );
  }

  getSalesPeople() {
    return this.salesPeople;
  }
}