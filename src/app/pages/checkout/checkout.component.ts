import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class Checkout {
  paymentPreview: string | ArrayBuffer | null = null;

  customer = {
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    paymentProof: '',
    deliveryType: '',
    address: ''
  };

  constructor(
    public storeService: StoreService,
    private router: Router,
    private apiService: ApiService
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.paymentPreview = reader.result;

        // save full base64 image
        this.customer.paymentProof = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  checkout() {
    if (
      !this.customer.name.trim() ||
      !this.customer.email.trim() ||
      !this.customer.phone.trim() ||
      !this.customer.whatsapp.trim() ||
      !this.customer.paymentProof.trim() ||
      !this.customer.deliveryType.trim()
    ) {
      alert('Please fill all required fields');
      return;
    }

    if (
      this.customer.deliveryType === 'Delivery' &&
      !this.customer.address.trim()
    ) {
      alert('Please enter delivery address');
      return;
    }

    this.apiService.placeOrder({
      customer_name: this.customer.name,
      email: this.customer.email,
      phone: this.customer.phone,
      whatsapp: this.customer.whatsapp,
      delivery_type: this.customer.deliveryType,
      delivery_address: this.customer.address,

      // actual image data
      payment_proof: this.customer.paymentProof,

      total_amount: this.storeService.getTotal(),

      // full cart items
      items: this.storeService.getCart()
    }).subscribe({
      next: () => {
        this.storeService.cart = [];
        this.router.navigate(['/order-confirm']);
      },
      error: (err) => {
        console.log(err);
        alert('Order failed');
      }
    });
  }
}