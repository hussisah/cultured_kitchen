import {
  Component,
  Input
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Product } from '../../models/product.model';

import { StoreService } from '../../services/store';

@Component({

  selector: 'app-product-card',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './product-card.component.html',

  styleUrl:
    './product-card.component.css'

})
export class ProductCardComponent {

  @Input()
  product!: Product;


  constructor(
    public storeService: StoreService
  ) {}


  // ==========================================
  // ADD TO CART
  // ==========================================

  addToCart() {

    this.storeService.addToCart(
      this.product
    );

  }


  // ==========================================
  // AVAILABLE STOCK
  // ==========================================

  get availableStock(): number {

    return this.storeService.getAvailableStock(
      this.product.id,
      Number(this.product.stock)
    );

  }

}