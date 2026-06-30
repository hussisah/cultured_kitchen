import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './order-confirm.component.html',
  styleUrl: './order-confirm.component.css',
})
export class OrderConfirm {
   customerName = localStorage.getItem('customerName');
}
