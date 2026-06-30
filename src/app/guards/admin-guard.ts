import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
   const role = localStorage.getItem('adminRole');

  if (role === 'CEO' || role === 'SALES') {
    return true;
  }

  return false;
};