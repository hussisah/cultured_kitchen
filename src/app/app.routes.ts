import { Routes } from '@angular/router';
import { Home } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { Cart } from './pages/cart/cart.component';
import { Checkout } from './pages/checkout/checkout.component';
import { OrderConfirm } from './pages/order-confirm/order-confirm.component';
import { AdminLogin } from './pages/admin/admin-login/admin-login.component';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';
import { adminGuard } from './guards/admin-guard';



export const routes: Routes = [
  { path: '', component: Home },
  { path: 'shop', component: ShopComponent },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout},
  { path: 'order-confirm', component: OrderConfirm },
  { path: 'admin-login', component: AdminLogin },
  {
  path: 'admin-dashboard',
  loadComponent: () =>
    import('./pages/admin/admin-dashboard/admin-dashboard')
      .then(m => m.AdminDashboard),
  canActivate: [adminGuard]
}
];