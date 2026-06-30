import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,   // needed for *ngFor
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class Home  {
  featuredProducts = [
    {
      id: 1,
      name: 'Premium Cookware Set',
      price: 45000,
      image: 'assets/images/cookware.jpg',
      stock: 10,
      category: 'Kitchen'
    },
    {
      id: 2,
      name: 'Decorative Plate Set',
      price: 18000,
      image: 'assets/images/plates.jpg',
      stock: 15,
      category: 'Dining'
    },
    {
      id: 3,
      name: 'Plate Rack',
      price: 12000,
      image: 'assets/images/platerack.jpg',
      stock: 8,
      category: 'Souvenirs'
    },
    {
      id: 4,
      name: 'Black & Gold Cooler Set',
      price: 25000,
      image: 'assets/images/black&goldcooler.jpg',
      stock: 6,
      category: 'Kitchen'
    }
  ];
}
