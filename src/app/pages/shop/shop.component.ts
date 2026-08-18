import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '../../services/products.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {

  searchTerm = '';
  selectedCategory = 'All';

  products: Product[] = [];
  categories: string[] = ['All'];

  loading = true;
  errorMessage = '';

  constructor(
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ==========================================
  // LOAD PRODUCTS FROM POSTGRESQL
  // ==========================================

  loadProducts(): void {

    this.loading = true;
    this.errorMessage = '';

    this.productsService.getProducts().subscribe({

      next: (products) => {

        this.products = products.map(product => ({
          ...product,
          price: Number(product.price),
          stock: Number(product.stock)
        }));

        // Create categories automatically from products
        const uniqueCategories = Array.from(
          new Set(
            this.products
              .map(product => product.category?.trim())
              .filter(category => !!category)
          )
        );

        this.categories = [
          'All',
          ...uniqueCategories
        ];

        this.loading = false;

        // Force Angular to update the page
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load products:',
          error
        );

        this.errorMessage =
          'Unable to load products. Please try again.';

        this.loading = false;

        // Force Angular to update the page
        this.cdr.detectChanges();
      }

    });
  }

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  filteredProducts(): Product[] {

    const search = this.searchTerm
      .toLowerCase()
      .trim();

    return this.products.filter(product => {

      const matchesCategory =
        this.selectedCategory === 'All' ||
        product.category === this.selectedCategory;

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search);

      return matchesCategory && matchesSearch;

    });
  }
}