import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // This is no longer used as the main source of shop inventory.
  // Products now come from PostgreSQL through ProductsService.
  products: Product[] = [];

  cart: any[] = [];
  orders: any[] = [];
  soldProducts: { [key: string]: number } = {};

  salesPeople: any[] = [];

  constructor() {

    if (this.isBrowser) {

      const savedSales =
        localStorage.getItem('salesPeople');

      this.salesPeople = savedSales
        ? JSON.parse(savedSales)
        : [
            {
              username: 'sales1',
              password: 'sales123'
            }
          ];

    } else {

      this.salesPeople = [
        {
          username: 'sales1',
          password: 'sales123'
        }
      ];

    }
  }


  // ==========================================
  // PRODUCTS
  // ==========================================

  getProducts() {
    return this.products;
  }


  setProducts(products: Product[]) {
    this.products = products;
  }


  addProduct(product: Product) {
    this.products.push(product);
  }


  deleteProduct(productId: number) {

    this.products = this.products.filter(
      product => product.id !== productId
    );

    // Also remove deleted product from cart
    this.cart = this.cart.filter(
      item => item.id !== productId
    );
  }


  // ==========================================
  // STOCK
  // ==========================================

  addStock(
    productId: number,
    amount: number
  ) {

    const product = this.products.find(
      product => product.id === productId
    );

    if (product) {
      product.stock += amount;
    }
  }


  reduceStock(
    productId: number,
    amount: number
  ) {

    const product = this.products.find(
      product => product.id === productId
    );

    if (product && product.stock >= amount) {
      product.stock -= amount;
    } else {
      alert('Not enough stock');
    }
  }


  // ==========================================
  // AVAILABLE STOCK
  // ==========================================

  getAvailableStock(
    productId: number,
    currentStock?: number
  ): number {

    const product =
      this.products.find(
        p => p.id === productId
      );

    const stock =
      currentStock !== undefined
        ? Number(currentStock)
        : product
          ? Number(product.stock)
          : 0;

    const cartItem =
      this.cart.find(
        item => item.id === productId
      );

    const cartQuantity =
      cartItem
        ? Number(cartItem.quantity)
        : 0;

    return Math.max(
      0,
      stock - cartQuantity
    );
  }


  // ==========================================
  // CART
  // ==========================================

  addToCart(product: Product) {

    const availableStock =
      this.getAvailableStock(
        product.id,
        product.stock
      );

    if (availableStock <= 0) {

      alert('Out of stock');

      return;
    }

    const existingItem =
      this.cart.find(
        item => item.id === product.id
      );

    if (existingItem) {

      if (
        existingItem.quantity >=
        Number(product.stock)
      ) {

        alert('No more stock available');

        return;
      }

      existingItem.quantity++;

    } else {

      this.cart.push({
        ...product,
        quantity: 1
      });

    }
  }


  getCart() {
    return this.cart;
  }


  getCartQuantity(productId: number): number {

    const item =
      this.cart.find(
        item => item.id === productId
      );

    return item
      ? Number(item.quantity)
      : 0;
  }


  increaseQuantity(index: number) {

    const item = this.cart[index];

    if (!item) {
      return;
    }

    const availableStock =
      Number(item.stock) -
      Number(item.quantity);

    if (availableStock <= 0) {

      alert('No more stock available');

      return;
    }

    item.quantity++;
  }


  decreaseQuantity(index: number) {

    const item = this.cart[index];

    if (!item) {
      return;
    }

    if (item.quantity > 1) {

      item.quantity--;

    } else {

      this.removeFromCart(index);

    }
  }


  removeFromCart(index: number) {

    if (
      index < 0 ||
      index >= this.cart.length
    ) {

      return;
    }

    this.cart.splice(index, 1);
  }


  getTotal() {

    return this.cart.reduce(
      (total, item) =>
        total +
        (Number(item.price) *
        Number(item.quantity)),
      0
    );
  }


  // ==========================================
  // ROLE
  // ==========================================

  getRole(): string {

    if (!this.isBrowser) {
      return '';
    }

    return (
      localStorage.getItem('adminRole') || ''
    );
  }


  isCEO(): boolean {

    return (
      this.getRole().trim() === 'CEO'
    );
  }


  isSales(): boolean {

    return (
      this.getRole().trim() === 'SALES'
    );
  }


  // ==========================================
  // SALES
  // ==========================================

  getSalesAnalytics() {
    return this.soldProducts;
  }


  // ==========================================
  // SALES PEOPLE
  // ==========================================

  addSalesPerson(
    username: string,
    password: string
  ) {

    this.salesPeople.push({
      username,
      password
    });

    if (this.isBrowser) {

      localStorage.setItem(
        'salesPeople',
        JSON.stringify(this.salesPeople)
      );

    }
  }


  deleteSalesPerson(index: number) {

    this.salesPeople.splice(index, 1);

    if (this.isBrowser) {

      localStorage.setItem(
        'salesPeople',
        JSON.stringify(this.salesPeople)
      );

    }
  }


  getSalesPeople() {
    return this.salesPeople;
  }

}