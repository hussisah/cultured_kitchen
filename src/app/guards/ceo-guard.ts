import { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const ceoGuard: CanActivateFn = () => {

  const platformId = inject(PLATFORM_ID);

  // Allow SSR to render the page shell.
  // The browser will perform the actual role check.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const role = localStorage.getItem('adminRole');

  return role?.trim() === 'CEO';
};