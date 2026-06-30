import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreService } from '../../services/store';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class Cart {
  constructor(public storeService: StoreService) {}

  get cartItems() {
    return this.storeService.getCart();
  }

  get total() {
    return this.storeService.getTotal();
  }

  removeItem(index: number) {
    this.storeService.removeFromCart(index);
  }

  increase(index: number) {
    this.storeService.increaseQuantity(index);
  }

  decrease(index: number) {
    this.storeService.decreaseQuantity(index);
  }
}