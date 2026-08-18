import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { StoreService } from '../../../services/store';
import { OrderService } from '../../../services/order.service';
import {
  ProductsService,
  Product
} from '../../../services/products.service';

import {
  CategoriesService,
  Category
} from '../../../services/categories.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {

  // Per-product stock amounts (was a single shared field before —
  // that meant every row used the same number).
  stockAmounts: { [productId: number]: number } = {};
  updatingProductId: number | null = null;

  lowStockThreshold = 10;

  newUsername = '';
  newPassword = '';

  orders: any[] = [];

  // =========================
  // CATEGORIES
  // =========================

  categories: Category[] = [];

  newCategoryName = '';

  loadingCategories = false;

  // =========================
  // PRODUCT
  // =========================

  newProduct = {
    name: '',
    price: 0,
    image: '',
    stock: 0,
    category: '',
    description: ''
  };

  selectedImagePreview = '';

  savingProduct = false;

  products: Product[] = [];

  loadingProducts = false;


  constructor(
    public storeService: StoreService,
    private orderService: OrderService,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {

    this.loadOrders();

    this.loadCategories();

    this.loadProducts();

    // Auto refresh orders every 3 seconds
    setInterval(() => {
      this.loadOrders();
    }, 3000);
  }


  // =========================
  // LOAD ORDERS
  // =========================

  loadOrders() {

    this.orderService.getOrders().subscribe({

      next: (data: any) => {

        this.orders = [...data];

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.log(err);

      }

    });
  }


  // =========================
  // LOAD PRODUCTS
  // =========================

  loadProducts() {

    this.loadingProducts = true;

    this.productsService.getProducts().subscribe({

      next: (data) => {

        this.products = data.map(product => ({
          ...product,
          price: Number(product.price),
          stock: Number(product.stock)
        }));

        this.loadingProducts = false;

      },

      error: (err) => {

        console.error(
          'Failed to load products:',
          err
        );

        this.loadingProducts = false;

      }

    });
  }


  // =========================
  // LOAD CATEGORIES
  // =========================

  loadCategories() {

    this.loadingCategories = true;

    this.categoriesService.getCategories().subscribe({

      next: (data) => {

        this.categories = data;

        this.loadingCategories = false;

        // Automatically select first category
        // if no category has been selected yet.

        if (
          !this.newProduct.category &&
          this.categories.length > 0
        ) {
          this.newProduct.category =
            this.categories[0].name;
        }

      },

      error: (err) => {

        console.error(
          'Failed to load categories:',
          err
        );

        this.loadingCategories = false;

      }

    });
  }


  // =========================
  // IMAGE SELECT
  // =========================

  onProductImageSelected(event: Event) {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Only allow images
    if (!file.type.startsWith('image/')) {

      alert('Please select an image file.');

      input.value = '';

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      this.newProduct.image =
        reader.result as string;

      this.selectedImagePreview =
        reader.result as string;

      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }


  // =========================
  // ADD PRODUCT
  // =========================

  addNewProduct() {

    if (!this.newProduct.name.trim()) {

      alert('Please enter a product name.');

      return;
    }


    if (
      !this.newProduct.price ||
      this.newProduct.price <= 0
    ) {

      alert('Please enter a valid price.');

      return;
    }


    if (
      !Number.isInteger(this.newProduct.stock) ||
      this.newProduct.stock < 0
    ) {

      alert('Please enter a valid stock quantity.');

      return;
    }


    if (!this.newProduct.category) {

      alert('Please select a category.');

      return;
    }


    if (!this.newProduct.description.trim()) {

      alert('Please enter a product description.');

      return;
    }


    if (!this.newProduct.image) {

      alert('Please select a product image.');

      return;
    }


    this.savingProduct = true;


    this.productsService
      .addProduct({

        name: this.newProduct.name.trim(),

        price: Number(this.newProduct.price),

        image: this.newProduct.image,

        stock: Number(this.newProduct.stock),

        category: this.newProduct.category,

        description:
          this.newProduct.description.trim()

      })
      .subscribe({

        next: (product) => {

          console.log(
            'Product added:',
            product
          );

          alert(
            `${product.name} was added successfully.`
          );

          this.resetProductForm();

          this.loadProducts();

        },

        error: (error) => {

          console.error(
            'Failed to add product:',
            error
          );

          alert(
            error?.error?.error ||
            'Failed to add product.'
          );

          this.savingProduct = false;
        },

        complete: () => {

          this.savingProduct = false;

        }

      });
  }


  // =========================
  // RESET PRODUCT FORM
  // =========================

  resetProductForm() {

    this.newProduct = {

      name: '',

      price: 0,

      image: '',

      stock: 0,

      category:
        this.categories.length > 0
          ? this.categories[0].name
          : '',

      description: ''

    };

    this.selectedImagePreview = '';
  }


  // =========================
  // ADD CATEGORY
  // =========================

  addCategory() {

    const name =
      this.newCategoryName.trim();


    if (!name) {

      alert('Enter a category name.');

      return;
    }


    this.categoriesService
      .addCategory(name)
      .subscribe({

        next: (category) => {

          alert(
            `${category.name} category added successfully.`
          );

          this.newCategoryName = '';

          this.loadCategories();

        },

        error: (error) => {

          console.error(
            'Failed to add category:',
            error
          );

          alert(
            error?.error?.error ||
            'Failed to add category.'
          );

        }

      });
  }


  // =========================
  // APPROVE ORDER
  // =========================

  approveOrder(id: number) {

    this.orderService
      .approveOrder(id)
      .subscribe(() => {

        this.loadOrders();

      });
  }


  // =========================
  // DECLINE ORDER
  // =========================

  declineOrder(id: number) {

    this.orderService
      .declineOrder(id)
      .subscribe(() => {

        this.loadOrders();

      });
  }


  // =========================
  // STOCK (now per-product)
  // =========================

  getStockAmount(productId: number): number {
    return Number(this.stockAmounts[productId] || 0);
  }

  addStock(product: Product) {

    const amount = this.getStockAmount(product.id);

    if (!Number.isInteger(amount) || amount <= 0) {
      alert('Enter a valid whole number greater than 0.');
      return;
    }

    this.updatingProductId = product.id;

    this.productsService
      .addStock(product.id, amount)
      .subscribe({

        next: () => {

          this.stockAmounts[product.id] = 0;
          this.updatingProductId = null;
          this.loadProducts();

        },

        error: (error) => {

          this.updatingProductId = null;

          alert(
            error?.error?.error ||
            'Failed to add stock.'
          );

        }

      });
  }


  reduceStock(product: Product) {

    const amount = this.getStockAmount(product.id);

    if (!Number.isInteger(amount) || amount <= 0) {
      alert('Enter a valid whole number greater than 0.');
      return;
    }

    if (amount > product.stock) {
      alert(`You cannot reduce more than the available stock (${product.stock}).`);
      return;
    }

    this.updatingProductId = product.id;

    this.productsService
      .reduceStock(product.id, amount)
      .subscribe({

        next: () => {

          this.stockAmounts[product.id] = 0;
          this.updatingProductId = null;
          this.loadProducts();

        },

        error: (error) => {

          this.updatingProductId = null;

          alert(
            error?.error?.error ||
            'Failed to reduce stock.'
          );

        }

      });
  }


  // =========================
  // INVENTORY WORTH / LOW STOCK
  // =========================

  getProductWorth(product: Product): number {
    return Number(product.price) * Number(product.stock);
  }

  getLowStockProducts(): Product[] {
    return this.products.filter(
      product => Number(product.stock) <= this.lowStockThreshold
    );
  }


  // =========================
  // DELETE PRODUCT
  // =========================

  deleteProduct(productId: number) {

    // NOTE: this still only removes the product from the old in-memory
    // StoreService array — it does NOT delete from Postgres, so it will
    // reappear after a refresh. A real DELETE /products/:id call is
    // needed here to actually remove it from the database.
    this.storeService.deleteProduct(productId);

  }


  // =========================
  // SALES PEOPLE
  // =========================

  addSalesPerson() {

    this.storeService.addSalesPerson(
      this.newUsername,
      this.newPassword
    );

    this.newUsername = '';
    this.newPassword = '';
  }


  deleteSalesPerson(index: number) {

    this.storeService.deleteSalesPerson(index);

  }


  // =========================
  // DELETE ORDER
  // =========================

  deleteOrder(id: number) {

    this.orderService
      .deleteOrder(id)
      .subscribe(() => {

        this.loadOrders();

      });
  }


  // =========================
  // LOGOUT
  // =========================

  logout() {

    localStorage.removeItem('adminRole');

    localStorage.removeItem('adminUser');

    window.location.href =
      '/admin-login';
  }
}