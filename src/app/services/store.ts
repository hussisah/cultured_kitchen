import {
  Injectable,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { Product } from '../models/product.model';

import { ToastService } from './toast.service';


@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private platformId = inject(PLATFORM_ID);

  private isBrowser =
    isPlatformBrowser(this.platformId);


  // ==========================================
  // PRODUCTS
  // ==========================================

  products: Product[] = [];


  // ==========================================
  // CART
  // ==========================================

  cart: any[] = [];

  cartItemCount = signal(0);


  // ==========================================
  // ORDERS / SALES
  // ==========================================

  orders: any[] = [];

  soldProducts: {
    [key: string]: number
  } = {};


  salesPeople: any[] = [];


  constructor(
    private toastService: ToastService
  ) {

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
  // UPDATE CART COUNT
  // ==========================================

  private updateCartCount(): void {

    const count =
      this.cart.reduce(
        (total: number, item: any) =>
          total + Number(item.quantity),
        0
      );

    this.cartItemCount.set(count);
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

    this.products =
      this.products.filter(
        product =>
          product.id !== productId
      );


    this.cart =
      this.cart.filter(
        item =>
          item.id !== productId
      );


    this.updateCartCount();

  }


  // ==========================================
  // STOCK
  // ==========================================

  addStock(
    productId: number,
    amount: number
  ) {

    const product =
      this.products.find(
        product =>
          product.id === productId
      );


    if (product) {

      product.stock += amount;

    }

  }


  reduceStock(
    productId: number,
    amount: number
  ) {

    const product =
      this.products.find(
        product =>
          product.id === productId
      );


    if (
      product &&
      product.stock >= amount
    ) {

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
        p =>
          p.id === productId
      );


    const stock =
      currentStock !== undefined
        ? Number(currentStock)
        : product
          ? Number(product.stock)
          : 0;


    const cartItem =
      this.cart.find(
        item =>
          item.id === productId
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
  // ADD TO CART
  // ==========================================

  addToCart(product: Product) {

    const availableStock =
      this.getAvailableStock(
        product.id,
        Number(product.stock)
      );


    if (availableStock <= 0) {

      this.toastService.show(
        'No more stock available'
      );

      return;

    }


    const existingItem =
      this.cart.find(
        item =>
          item.id === product.id
      );


    if (existingItem) {

      if (
        Number(existingItem.quantity) >=
        Number(product.stock)
      ) {

        this.toastService.show(
          'No more stock available'
        );

        return;

      }


      existingItem.quantity++;


      this.updateCartCount();


      this.toastService.show(
        `${product.name} quantity increased`
      );


    } else {

      this.cart.push({
        ...product,
        quantity: 1
      });


      this.updateCartCount();


      this.toastService.show(
        `${product.name} added to cart`
      );

    }

  }


  // ==========================================
  // GET CART
  // ==========================================

  getCart() {

    return this.cart;

  }


  // ==========================================
  // GET PRODUCT CART QUANTITY
  // ==========================================

  getCartQuantity(
    productId: number
  ): number {

    const item =
      this.cart.find(
        item =>
          item.id === productId
      );


    return item
      ? Number(item.quantity)
      : 0;

  }


  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  increaseQuantity(index: number) {

    const item =
      this.cart[index];


    if (!item) {

      return;

    }


    const availableStock =
      Number(item.stock) -
      Number(item.quantity);


    if (availableStock <= 0) {

      this.toastService.show(
        'No more stock available'
      );

      return;

    }


    item.quantity++;


    this.updateCartCount();


    this.toastService.show(
      `${item.name} quantity increased`
    );

  }


  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  decreaseQuantity(index: number) {

    const item =
      this.cart[index];


    if (!item) {

      return;

    }


    if (
      Number(item.quantity) > 1
    ) {

      item.quantity--;


      this.updateCartCount();


      this.toastService.show(
        `${item.name} quantity reduced`
      );


    } else {

      this.removeFromCart(index);

    }

  }


  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  removeFromCart(index: number) {

    if (
      index < 0 ||
      index >= this.cart.length
    ) {

      return;

    }


    const item =
      this.cart[index];


    this.cart.splice(index, 1);


    this.updateCartCount();


    this.toastService.show(
      `${item.name} removed from cart`
    );

  }


  // ==========================================
  // TOTAL
  // ==========================================

  getTotal() {

    return this.cart.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        (
          Number(item.price) *
          Number(item.quantity)
        ),
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
      localStorage.getItem(
        'adminRole'
      ) || ''
    );

  }


  isCEO(): boolean {

    return (
      this.getRole().trim() ===
      'CEO'
    );

  }


  isSales(): boolean {

    return (
      this.getRole().trim() ===
      'SALES'
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
        JSON.stringify(
          this.salesPeople
        )
      );

    }

  }


  deleteSalesPerson(index: number) {

    this.salesPeople.splice(
      index,
      1
    );


    if (this.isBrowser) {

      localStorage.setItem(
        'salesPeople',
        JSON.stringify(
          this.salesPeople
        )
      );

    }

  }


  getSalesPeople() {

    return this.salesPeople;

  }

}