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
  console.log('LOGIN CLICKED - username:', JSON.stringify(this.username), 'password:', JSON.stringify(this.password));

  if (this.username === 'ceo' && this.password === 'ceo123') {
    console.log('CEO MATCH - opening tab');
    localStorage.setItem('adminRole', 'CEO');
    localStorage.setItem('adminUser', 'ceo');
    window.open('/admin-dashboard', '_blank');
    return;
  }

  console.log('NOT CEO - checking sales people');
  const salesPeople = JSON.parse(localStorage.getItem('salesPeople') || '[]');
  const salesUser = salesPeople.find(
    (user: any) => user.username === this.username && user.password === this.password
  );

  if (salesUser) {
    console.log('SALES MATCH - opening tab');
    localStorage.setItem('adminRole', 'SALES');
    localStorage.setItem('adminUser', salesUser.username);
    window.open('/admin-dashboard', '_blank');
  } else {
    console.log('NO MATCH AT ALL');
    alert('Invalid login details');
  }
}
   private openDashboardInNewTab() {
    // Opens dashboard in a new tab; window.open works here since
    // it's called synchronously inside the click handler (user gesture)
    window.open('/admin-dashboard', '_blank');
  }
}
