import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../../services/order.service';
import {
  ProductsService,
  Product
} from '../../../services/products.service';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  total_amount: number | string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface BestSeller {
  name: string;
  quantity: number;
  revenue: number;
}

interface RevenueDay {
  date: string;
  label: string;
  revenue: number;
}

@Component({
  selector: 'app-audit-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-tab.html',
  styleUrl: './audit-tab.css'
})
export class AuditTab implements OnInit {

  // ==========================================
  // INVENTORY
  // ==========================================

  products: Product[] = [];

  loadingProducts = true;
  productError = '';

  stockAmounts: { [productId: number]: number } = {};

  updatingProductId: number | null = null;


  // ==========================================
  // ORDERS / ANALYTICS
  // ==========================================

  orders: Order[] = [];

  loadingOrders = true;
  orderError = '';

  totalRevenue = 0;
  totalOrders = 0;
  averageOrderValue = 0;

  bestSellers: BestSeller[] = [];

  revenueByDay: RevenueDay[] = [];

  maxRevenue = 0;


  // ==========================================
  // LOW STOCK
  // ==========================================

  lowStockThreshold = 10;


  constructor(
    private productsService: ProductsService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
  }


  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  loadProducts(): void {

    this.loadingProducts = true;
    this.productError = '';

    this.productsService.getProducts().subscribe({

      next: (products) => {

        this.products = products.map(product => ({
          ...product,
          price: Number(product.price),
          stock: Number(product.stock)
        }));

        this.loadingProducts = false;

        // Force Angular to update the page
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load products:',
          error
        );

        this.productError =
          'Failed to load products from PostgreSQL.';

        this.loadingProducts = false;

        // Force Angular to update the page
        this.cdr.detectChanges();
      }

    });
  }


  // ==========================================
  // LOAD ORDERS
  // ==========================================

  loadOrders(): void {

    this.loadingOrders = true;
    this.orderError = '';

    this.orderService.getOrders().subscribe({

      next: (data: any) => {

        this.orders = Array.isArray(data)
          ? data.map((order: any) => ({
              ...order,
              total_amount: Number(order.total_amount),
              items: Array.isArray(order.items)
                ? order.items
                : []
            }))
          : [];

        this.calculateAnalytics();

        this.loadingOrders = false;

        // Force Angular to update the page
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load orders:',
          error
        );

        this.orderError =
          'Failed to load sales data.';

        this.loadingOrders = false;

        // Force Angular to update the page
        this.cdr.detectChanges();
      }

    });
  }


  // ==========================================
  // CALCULATE ANALYTICS
  // ==========================================

  calculateAnalytics(): void {

    // Only approved orders count as actual sales.
    const approvedOrders = this.orders.filter(
      order =>
        String(order.status).toLowerCase() === 'approved'
    );

    this.totalOrders = approvedOrders.length;

    this.totalRevenue = approvedOrders.reduce(
      (total, order) =>
        total + Number(order.total_amount || 0),
      0
    );

    this.averageOrderValue =
      this.totalOrders > 0
        ? this.totalRevenue / this.totalOrders
        : 0;

    this.calculateBestSellers(approvedOrders);

    this.calculateRevenueByDay(approvedOrders);
  }


  // ==========================================
  // BEST SELLERS
  // CURRENT MONTH ONLY
  // ==========================================

  calculateBestSellers(orders: Order[]): void {

    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const salesMap: {
      [name: string]: BestSeller
    } = {};

    orders.forEach(order => {

      const orderDate = new Date(order.created_at);

      if (
        orderDate.getFullYear() !== currentYear ||
        orderDate.getMonth() !== currentMonth
      ) {
        return;
      }

      order.items.forEach(item => {

        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        if (!salesMap[item.name]) {

          salesMap[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          };

        }

        salesMap[item.name].quantity += quantity;

        salesMap[item.name].revenue +=
          price * quantity;

      });

    });

    this.bestSellers = Object.values(salesMap)
      .sort((a, b) => {

        if (b.quantity !== a.quantity) {
          return b.quantity - a.quantity;
        }

        return b.revenue - a.revenue;

      })
      .slice(0, 5);
  }


  // ==========================================
  // REVENUE BY DAY
  // ==========================================

  calculateRevenueByDay(orders: Order[]): void {

    const revenueMap: {
      [date: string]: number
    } = {};

    orders.forEach(order => {

      const date = new Date(order.created_at);

      const dateKey =
        date.toISOString().split('T')[0];

      revenueMap[dateKey] =
        (revenueMap[dateKey] || 0) +
        Number(order.total_amount || 0);

    });

    this.revenueByDay = Object.entries(revenueMap)
      .sort(([dateA], [dateB]) =>
        dateA.localeCompare(dateB)
      )
      .map(([date, revenue]) => {

        const parsedDate = new Date(
          `${date}T00:00:00`
        );

        return {
          date,
          label: parsedDate.toLocaleDateString(
            'en-NG',
            {
              day: 'numeric',
              month: 'short'
            }
          ),
          revenue
        };

      });

    this.maxRevenue =
      this.revenueByDay.length > 0
        ? Math.max(
            ...this.revenueByDay.map(
              item => item.revenue
            )
          )
        : 0;
  }


  // ==========================================
  // CHART BAR HEIGHT
  // ==========================================

  getRevenueBarHeight(
    revenue: number
  ): number {

    if (this.maxRevenue <= 0) {
      return 0;
    }

    return (revenue / this.maxRevenue) * 100;
  }


  // ==========================================
  // STOCK AMOUNT
  // ==========================================

  getStockAmount(productId: number): number {

    return Number(
      this.stockAmounts[productId] || 0
    );
  }


  // ==========================================
  // ADD STOCK
  // ==========================================

  addStock(product: Product): void {

    const amount =
      this.getStockAmount(product.id);

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {

      alert(
        'Enter a valid whole number greater than 0.'
      );

      return;
    }

    this.updatingProductId = product.id;

    this.productsService
      .addStock(product.id, amount)
      .subscribe({

        next: (updatedProduct) => {

          const index =
            this.products.findIndex(
              p => p.id === product.id
            );

          if (index !== -1) {

            this.products[index] = {
              ...updatedProduct,
              price: Number(updatedProduct.price),
              stock: Number(updatedProduct.stock)
            };

          }

          this.stockAmounts[product.id] = 0;

          this.updatingProductId = null;

          // Force Angular to update the page
          this.cdr.detectChanges();

          alert(
            `${product.name}: ${amount} stock added successfully.`
          );
        },

        error: (error) => {

          console.error(
            'Failed to add stock:',
            error
          );

          this.updatingProductId = null;

          this.cdr.detectChanges();

          alert(
            error?.error?.error ||
            'Failed to add stock.'
          );
        }

      });
  }


  // ==========================================
  // REDUCE STOCK
  // ==========================================

  reduceStock(product: Product): void {

    const amount =
      this.getStockAmount(product.id);

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {

      alert(
        'Enter a valid whole number greater than 0.'
      );

      return;
    }

    if (amount > product.stock) {

      alert(
        `You cannot reduce more than the available stock (${product.stock}).`
      );

      return;
    }

    this.updatingProductId = product.id;

    this.productsService
      .reduceStock(product.id, amount)
      .subscribe({

        next: (updatedProduct) => {

          const index =
            this.products.findIndex(
              p => p.id === product.id
            );

          if (index !== -1) {

            this.products[index] = {
              ...updatedProduct,
              price: Number(updatedProduct.price),
              stock: Number(updatedProduct.stock)
            };

          }

          this.stockAmounts[product.id] = 0;

          this.updatingProductId = null;

          // Force Angular to update the page
          this.cdr.detectChanges();

          alert(
            `${product.name}: ${amount} stock reduced successfully.`
          );
        },

        error: (error) => {

          console.error(
            'Failed to reduce stock:',
            error
          );

          this.updatingProductId = null;

          this.cdr.detectChanges();

          alert(
            error?.error?.error ||
            'Failed to reduce stock.'
          );
        }

      });
  }


  // ==========================================
  // INVENTORY WORTH
  // ==========================================

  getProductWorth(product: Product): number {

    return (
      Number(product.price) *
      Number(product.stock)
    );
  }


  // ==========================================
  // LOW STOCK PRODUCTS
  // ==========================================

  getLowStockProducts(): Product[] {

    return this.products.filter(
      product =>
        Number(product.stock) <=
        this.lowStockThreshold
    );
  }


  // ==========================================
  // REFRESH
  // ==========================================

  // ==========================================
// DELETE PRODUCT
// CEO ONLY
// ==========================================

deleteProduct(product: Product): void {

  const confirmed = confirm(
    `Are you sure you want to delete "${product.name}"?`
  );

  if (!confirmed) {
    return;
  }

  this.updatingProductId = product.id;

  this.productsService
    .deleteProduct(product.id)
    .subscribe({

      next: () => {

        // Remove product immediately
        // from the inventory table
        this.products =
          this.products.filter(
            p => p.id !== product.id
          );

        this.updatingProductId = null;

        this.cdr.detectChanges();

        alert(
          `${product.name} deleted successfully.`
        );

      },

      error: (error) => {

        console.error(
          'Failed to delete product:',
          error
        );

        this.updatingProductId = null;

        this.cdr.detectChanges();

        alert(
          error?.error?.error ||
          'Failed to delete product.'
        );

      }

    });
}

  refreshAudit(): void {

    this.loadProducts();
    this.loadOrders();
  }
}