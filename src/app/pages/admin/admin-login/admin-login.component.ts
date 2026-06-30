import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLogin {
  username = '';
  password = '';

  constructor(private router: Router) {}

  login() {
    if (
      this.username === 'ceo' &&
      this.password === 'ceo123'
    ) {
      localStorage.setItem('adminRole', 'CEO');
      localStorage.setItem('adminUser', 'ceo');
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    const salesPeople = JSON.parse(
      localStorage.getItem('salesPeople') || '[]'
    );

    const salesUser = salesPeople.find(
      (user: any) =>
        user.username === this.username &&
        user.password === this.password
    );

    if (salesUser) {
      localStorage.setItem('adminRole', 'SALES');
      localStorage.setItem('adminUser', salesUser.username);
      this.router.navigate(['/admin-dashboard']);
    } else {
      alert('Invalid login details');
    }
  }
}