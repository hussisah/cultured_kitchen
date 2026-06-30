import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store';

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
export class ShopComponent {
  searchTerm = '';
  selectedCategory = 'All';

  categories = ['All', 'Kitchen', 'Dining', 'Souvenirs'];

  constructor(public storeService: StoreService) {}

  filteredProducts() {
    return this.storeService.products.filter(product => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        product.category === this.selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(
          this.searchTerm.toLowerCase()
        );

      return matchesCategory && matchesSearch;
    });
  }
}