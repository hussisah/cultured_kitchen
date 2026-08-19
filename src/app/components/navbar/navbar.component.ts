import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { StoreService } from '../../services/store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(
    public storeService: StoreService
  ) {}

  get cartItemCount(): number {
    return this.storeService.cartItemCount();
  }

}